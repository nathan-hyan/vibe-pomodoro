# CLAUDE.md — Vibe Pomodoro Codebase Guide

## What Is This App?

A single-page Pomodoro timer with integrated todo list and statistics tracking. Users start a 25-minute focus session, manage tasks during the session, and view productivity stats. Data is persisted via a JSON Server backend (not localStorage), making it suitable for self-hosted Docker/CasaOS deployments.

## Tech Stack

- **React 19** + **TypeScript** (strict mode) + **Vite** (with Rolldown)
- **TailwindCSS 4** (via `@tailwindcss/vite` plugin, no `tailwind.config` file — uses CSS-first config in `index.css`)
- **React Query (TanStack Query v5)** for server state management
- **JSON Server** (`json-server@1.0.0-beta.3`) as the REST API backend
- **React Compiler** enabled via `babel-plugin-react-compiler`
- **Bun** as the preferred package manager (npm also supported)
- **React 19 features**: native `ref` as prop (no `forwardRef`), `useSuspenseQuery` + `<Suspense>` for loading states, `useSyncExternalStore` for shared ephemeral state

## Project Structure

```
src/
├── App.tsx                  # Root layout: 3-column grid (timer | todos + stats)
├── main.tsx                 # Entry point: QueryClientProvider + Suspense boundary
├── index.css                # Tailwind import + custom glass-glow/cursor-glow CSS
├── components/
│   ├── Timer.tsx            # SVG circular progress + editable time display
│   ├── Controls.tsx         # Start/Pause/Reset + time adjustment buttons
│   ├── TodoList.tsx         # 3-section task list (working/pending/completed) + inline edit + drag
│   ├── Statistics.tsx       # Stats dashboard (React 19 ref-as-prop)
│   ├── CompletionModal.tsx  # Session complete overlay with extend options
│   └── SettingsModal.tsx    # Reset stats, export/import data
├── stores/
│   └── sessionTasksStore.ts # useSyncExternalStore: ephemeral session task tracking
├── hooks/
│   ├── usePomodoro.ts       # Core timer logic (setInterval-based countdown)
│   ├── useQueryStats.ts     # React Query (useSuspenseQuery) queries/mutations for stats
│   ├── useQueryTodos.ts     # React Query (useSuspenseQuery) queries/mutations for todos
│   ├── useStats.ts          # Composes React Query stats hooks + session tasks store
│   └── useTodos.ts          # Composes React Query todo hooks + stats side effects
├── services/
│   └── api.ts               # All API functions (fetch-based): CRUD todos, stats, export/import
├── lib/
│   └── queryClient.ts       # QueryClient config (1min stale, 3 retries, no refetch on focus)
├── types/
│   └── index.ts             # Todo, TodoStatus, Stats, StatEntry, StatEntryType, PomodoroState, PomodoroControls
└── utils/
    ├── alarmSound.ts        # Web Audio API: task chime + session alarm
    ├── dateFilters.ts       # isToday, isThisWeek, isThisMonth for stat entries
    ├── formatTime.ts        # formatTime (MM:SS) + formatTimeVerbose (Xh Ym)
    ├── getApiUrl.ts         # Dynamic API URL (VITE_API_URL → window.location fallback)
    └── glowEffect.ts        # Mouse-tracking CSS variable updater for glow effects
```

## Architecture & Data Flow

### State Management — Three Layers

1. **Server state** via React Query (`useSuspenseQuery` in `useQueryTodos`, `useQueryStats`) — all CRUD goes through `src/services/api.ts` → JSON Server on port 3001. Suspense boundaries handle loading states declaratively.
2. **Shared ephemeral state** via `useSyncExternalStore` (`src/stores/sessionTasksStore.ts`) — tracks tasks completed during the current pomodoro session. Not persisted. Module-level store, no provider needed.
3. **Local component state** — form inputs (`inputValue` in `TodoList`), UI toggles (`showSettings` in `App`), drag state.

### Component Tree

```
<StrictMode>                   # main.tsx
  <QueryClientProvider>        # main.tsx — only provider needed
    <Suspense fallback={...}>  # main.tsx — catches useSuspenseQuery loading
      <App />                  # App.tsx — flat, no nesting of providers
    </Suspense>
  </QueryClientProvider>
</StrictMode>
```

**Note:** No React Context is used. `useStats()` and `useTodos()` are composing hooks that internally call React Query hooks and the session tasks store. React Query deduplicates queries across components automatically.

### API Layer

- `src/services/api.ts` — single `fetchApi<T>()` wrapper over native `fetch`. Handles todos CRUD, stats CRUD, and bulk export/import.
- `src/utils/getApiUrl.ts` — runtime URL resolution: checks `import.meta.env.VITE_API_URL` first, falls back to localhost:3001 in dev, same-hostname:3001 in production.
- **Optimistic updates** on all mutations via React Query's `onMutate`/`onError` rollback pattern.

### Timer Logic (`usePomodoro`)

- `setInterval`-based, 1-second ticks. Not drift-corrected.
- Tracks `sessionStartTime` (the timer value when session started, used to calculate worked time).
- `hasCountedSessionRef` prevents double-counting sessions.
- On completion: plays alarm sound, shows completion modal, records session via `addCompletedSession`.
- The user can click the timer display to directly edit time (MM:SS format) when paused.

### Database Schema (`db.json`)

```json
{
  "todos": [{ "id": "string", "text": "string", "status": "working"|"pending"|"completed", "order": number }],
  "stats": { "totalTimeWorked": number, "completedSessions": number, "completedTasks": number },
  "statEntries": [{ "id": "string", "type": "session"|"task", "value": number, "timestamp": "ISO 8601" }]
}
```

- `stats` is a singular resource in JSON Server (not an array), updated via `PUT`. Stores all-time aggregate totals.
- `statEntries` is a collection (array) of timestamped events. Each entry records a session completion (`type: "session"`, `value` = duration in seconds) or task completion/uncompletion (`type: "task"`, `value` = 1 or -1). Used for day/week/month breakdowns.

## Focus Tasks Feature — ✅ IMPLEMENTED

### Data Model
```ts
type TodoStatus = "working" | "pending" | "completed";
interface Todo { id: string; text: string; status: TodoStatus; order: number; }
```

Replaced old `completed: boolean` with `status: TodoStatus` enum + `order: number` for priority ordering.

### Three-Section Layout
```
--- Currently working on ---   (status: "working")  ← tasks actively being worked on
--- Next tasks ---             (status: "pending")   ← queued, ordered by priority
--- Finished ---               (status: "completed") ← done, shown at bottom
```
- New tasks land in "Next tasks" (`status: "pending"`)
- Users promote/demote between "working" ↔ "pending" via ▲/▼ buttons
- Checkbox completes (→ "Finished") or uncompletes (→ "Next tasks")
- Empty sections are hidden automatically
- Drag-and-drop reorder within "working" and "pending" only; completed not draggable

### Hook API (`useTodos`)
- `addTodo(text)` — creates pending todo, trims whitespace, rejects empty
- `deleteTodo(id)` — removes from any section
- `editTodo(id, newText)` — updates text, trims, rejects empty
- `completeTodo(id)` — marks completed, plays chime, increments stats, adds session task
- `uncompleteTodo(id)` — marks pending, decrements stats, removes session task
- `promoteToWorking(id)` — pending → working (no chime)
- `demoteFromWorking(id)` — working → pending (no chime)
- `reorderTodos(sectionTodos, from, to)` — reorders within a section
- Computed: `workingTodos`, `pendingTodos`, `completedTodos` (sorted by `order`)

### UI (`TodoList.tsx`)
- Inline editing: double-click text → input, Enter/blur saves, Escape cancels
- Delete via ✕ button (always visible per UX preference — hover-hidden buttons are easy to miss)
- Promote/demote via ▲/▼ buttons (always visible)

### Design Notes
- Action buttons (delete ✕, promote ▲, demote ▼) are **always visible** rather than hover-revealed. This is a deliberate UX choice — hover-gated actions are discoverable only by accident and unusable on touch devices.
- The `db.json` may contain legacy todos with `completed: boolean` from before the migration. The app only reads `status`; those old records will render but won't sort into any section (they lack a valid `status`). Clean them up manually or re-seed `db.json`.
- `reorderTodos` fires N individual PATCH requests — acceptable for a small todo list but would need batching for scale.
- `order` values can have gaps after deletions; this is harmless since only relative ordering matters.

### Tests
- **52 unit tests** in `src/test/todos.test.tsx` (Vitest + React Testing Library)
- **9 E2E tests** in `e2e/todos.spec.ts` (Playwright)
- Integration plan: `docs/FOCUS_TASKS_PLAN.md`

## Statistics Feature — ✅ IMPLEMENTED

### Data Model
```ts
type StatEntryType = "session" | "task";
interface StatEntry { id: string; type: StatEntryType; value: number; timestamp: string; }
```

Added `statEntries` event log alongside the existing `stats` aggregate. Dual-write pattern: every session/task event updates both the aggregate and creates a timestamped entry.

### Time-Based Metrics
- **Default display**: shows today's values for Time Worked, Sessions Done, Tasks Done
- **Hover expansion**: each of the three metrics expands to show Today / This Week / This Month
- **Tasks Left**: simple count of non-completed todos (not time-based)
- Date filtering via `src/utils/dateFilters.ts`: `isToday()`, `isThisWeek()`, `isThisMonth()`

### Component Architecture (`Statistics.tsx`)
- `ExpandableStatRow` — manages hover state, toggles between single-value and 3-period expanded view
- `SimpleStatRow` — non-expandable row (used for Tasks Left)
- `data-expandable` attribute on expandable rows for test targeting

### Hook API (`useStats`)
- `dayStats: PeriodStats` — `{ timeWorked, sessions, tasks }` for today
- `weekStats: PeriodStats` — for current week (Monday–Sunday)
- `monthStats: PeriodStats` — for current calendar month
- `statEntries: StatEntry[]` — raw event log
- `addCompletedSession(duration)` — updates aggregate + creates session entry
- `incrementCompletedTasks()` — updates aggregate + creates task entry (value: 1)
- `decrementCompletedTasks()` — updates aggregate + creates task entry (value: -1)
- `resetStats()` — resets aggregate to zeros + deletes all entries + clears session tasks

### Settings
- Reset All Statistics (existing button) now also clears `statEntries` collection
- Confirmation via `window.confirm` before reset

### Tests
- **25 unit tests** in `src/test/statistics.test.tsx` (Vitest + React Testing Library)
- **9 E2E tests** in `e2e/statistics.spec.ts` (Playwright)
- Integration plan: `docs/STATISTICS_PLAN.md`

### Files Changed
- `src/types/index.ts` — `StatEntry`, `StatEntryType` types
- `src/services/api.ts` — `getStatEntries`, `createStatEntry`, `deleteAllStatEntries`
- `src/utils/dateFilters.ts` — **New** — date filtering utilities
- `src/hooks/useQueryStats.ts` — stat entries query/mutations
- `src/hooks/useStats.ts` — `PeriodStats` type, `computePeriodStats`, day/week/month computed values, dual-write on events
- `src/components/Statistics.tsx` — full rewrite with `ExpandableStatRow`/`SimpleStatRow`
- `db.json` — added `statEntries: []`

## TODOs, Known Issues & Roadmap

All open TODOs, known issues, planned features, and technical debt are tracked in **[docs/ROADMAP.md](./docs/ROADMAP.md)**. Refer to that document when starting a new session.

## Commands

```bash
bun install          # Install deps
bun run dev          # Start dev (JSON Server on :3001 + Vite on :5173)
bun run build        # TypeScript check + Vite build
bun run lint         # ESLint
bun run preview      # Preview production build
bun run start        # Production mode (JSON Server + Vite preview)
bun run test         # Vitest in watch mode
bun run test:unit    # Vitest single run
bun run test:e2e     # Playwright E2E (needs dev server running)
```

## Conventions

- **Test-Driven Development (TDD) is mandatory** — every bugfix and new feature must start by writing or updating tests *before* implementing the change. Write a failing test that reproduces the bug or specifies the new behavior, then make it pass. This applies to both unit tests (Vitest) and E2E tests (Playwright) as appropriate. Never skip tests.
- **No component library** — all UI is hand-crafted with Tailwind utility classes
- **Emoji icons** throughout (no icon library)
- **Glass morphism** design language with violet/purple gradients on a dark background
- **No React Context** — state is composed via hooks (`useStats`, `useTodos`) that internally use React Query + `useSyncExternalStore`
- **Hook naming**: `useQuery*` for React Query wrappers, `use*` for composing hooks consumed by components
- **Shared types** in `src/types/index.ts` — `Todo`, `Stats`, `PomodoroState`, `PomodoroControls`
- **External store pattern** — `src/stores/sessionTasksStore.ts` uses `useSyncExternalStore` for ephemeral shared state without providers
- **No barrel exports** — direct file imports throughout
