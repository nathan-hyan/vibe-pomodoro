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
│   ├── TodoList.tsx         # Task input (local state) + draggable list
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
│   └── index.ts             # Todo, Stats, PomodoroState, PomodoroControls interfaces
└── utils/
    ├── alarmSound.ts        # Web Audio API: task chime + session alarm
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
- `src/utils/getApiUrl.ts` — runtime URL resolution: localhost:3001 in dev, same-hostname:3001 in production. The `VITE_API_URL` env var mentioned in docs is **not actually read** by this function — it purely checks `window.location`.
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
  "todos": [{ "id": "string", "text": "string", "completed": boolean, "order": number }],
  "stats": { "totalTimeWorked": number, "completedSessions": number, "completedTasks": number }
}
```

`stats` is a singular resource in JSON Server (not an array), updated via `PUT`.

## Existing TODOs Left by the Author

Collected from source code comments:

1. **`App.tsx:22`** — Consider extracting glow effect setup into a custom hook or wrapper container
2. ~~**`App.tsx:47`** — Move providers to root level (`main.tsx`)~~ — **DONE**: Providers moved; then Context layer eliminated entirely.
3. **`App.tsx:43`** — i18n support (nice to have)
4. **`App.tsx:44`** — Create a design system with reusable button components
5. **`App.tsx:45`** — Unify modal components (`CompletionModal` and `SettingsModal` share structure)
6. ~~**`TodoContext.tsx:17-19`** — Use proper UUID generation instead of `Date.now()`, text capitalization, Zod validation~~ — Context deleted; UUID/validation TODOs remain relevant for `useTodos.ts`.
7. **`usePomodoro.ts:23`** — Extract timer logic to a separate util
8. **`usePomodoro.ts:50`** — Create a modal hook with show/toggle
9. ~~**`Timer.tsx:15`** — Move `formatTime` to utils~~ — **DONE** (previous session)
10. ~~**`Timer.tsx:165`** — `onKeyPress` is deprecated, use `onKeyDown`~~ — **DONE** (previous session)
11. ~~**`Timer.tsx:176`** — Use a `classNames` utility (e.g., clsx/cn)~~ — **DONE** (previous session)
12. ~~**`TodoList.tsx:50`** — Same `onKeyPress` deprecation~~ — **DONE** (previous session)
13. ~~**`Statistics.tsx:5`** — React 19 may not need `forwardRef`~~ — **DONE**: Replaced with native `ref` prop.
14. ~~**`Statistics.tsx:73`** — `displayName` may be unnecessary~~ — **DONE**: Removed with `forwardRef`.
15. ~~**`useStats.ts:4`** — Consider renaming `useStats` → `useStatistics`~~ — Kept as `useStats` (short, clear).

## Assumptions & Observations

### Things That Work Well
- **Optimistic UI** across all mutations is properly implemented with rollback
- **Clean separation** between React Query hooks (`useQuery*`) and composing hooks (`useStats`/`useTodos`)
- **Docker setup** is mature — multi-stage build, entrypoint script, CasaOS support, health checks
- **Audio feedback** via Web Audio API (no external audio files needed)
- **Glow effect** is a nice touch — mouse-tracking CSS variables for glassmorphism cards

### Potential Issues / Areas for Improvement

- **Timer drift**: `setInterval` with 1s ticks will drift over long sessions. A `Date.now()`-based approach (checking elapsed time each tick) would be more accurate.
- ~~**Unused dependencies**: `apisauce` — **FIXED**: removed package and dead service files.~~
- ~~**`VITE_API_URL` env var is ignored** — **FIXED**: `getApiUrl.ts` now reads `import.meta.env.VITE_API_URL` first, falling back to dynamic resolution.~~
- **No tests**: Zero test files. No test runner configured.
- **No routing**: Single-page app with no router. If features grow (e.g., separate stats page, settings page), a router will be needed.
- **Drag & drop is basic**: Uses native HTML5 drag events. On mobile/touch this won't work. Consider `@dnd-kit` or similar for touch support.
- **`reorderTodos`** fires N PATCH requests (one per todo). This is a known limitation noted in the code — could be slow with many todos.
- **No break timer**: Classic Pomodoro has a 5-min short break / 15-min long break cycle. This app only has the work timer.
- ~~**`Stats` interface is duplicated** — **FIXED**: single source of truth in `src/types/index.ts`, re-exported from `api.ts`.~~
- **Import deletes & recreates all todos**: The `importData` function nukes all existing todos then recreates them. IDs will change, which could cause issues if the app is open in another tab.
- **No error UI**: API errors are caught and logged to console, but no toast/notification system exists for the user.
- **Statistics component is hidden on mobile**: `lg:block hidden` on the stats section means mobile users can't see their stats.
- ~~**`playAlarmSound` (looping version)** — **FIXED**: removed unused looping function from `alarmSound.ts`.~~
- **`completedTasks` in stats vs in todos**: The stats counter (`completedTasks`) and the actual count of completed todos can diverge — stats counts all-time completions across sessions, while todos list only shows current tasks.

## Potential Next Steps

### Quick Wins (Low Effort, High Impact) — ✅ ALL DONE
1. ~~**Replace deprecated `onKeyPress` with `onKeyDown`** — in `Timer.tsx` and `TodoList.tsx`.~~
2. ~~**Remove unused `apisauce` dependency** — deleted `src/services/stats.ts`, `src/services/todos.ts`, uninstalled package.~~
3. ~~**Remove unused `playAlarmSound` (looping)** — removed dead code from `alarmSound.ts`.~~
4. ~~**Add `clsx` utility** — installed `clsx`, applied to `Timer.tsx` and `TodoList.tsx`.~~
5. ~~**Move `formatTime` to a shared util** — created `src/utils/formatTime.ts` with `formatTime` and `formatTimeVerbose`.~~
6. ~~**Fix `VITE_API_URL` env var** — `getApiUrl.ts` now reads `import.meta.env.VITE_API_URL` first, falls back to dynamic resolution.~~
7. ~~**Deduplicate `Stats` interface** — single source of truth in `StatsContextDefinition.ts`, re-exported from `api.ts`.~~

### Code Quality & Architecture — ✅ MAJOR REFACTOR DONE
8. ~~**Move providers to `main.tsx`**~~ — **DONE**, then eliminated Context layer entirely.
9. **Unify modal components** — `CompletionModal` and `SettingsModal` share the same backdrop/container pattern. Extract a reusable `Modal` shell.
10. **Extract glow effect into a custom hook or wrapper** — the `useEffect` + refs pattern in `App.tsx` could be a `useGlowEffect(ref)` hook or a `<GlowCard>` component.
11. **Use proper UUID generation** — `Date.now().toString()` for todo IDs risks collisions. Use `crypto.randomUUID()`.
12. **Add Zod validation** — validate API responses and form inputs (author TODO).
13. ~~**React 19 `ref` as prop**~~ — **DONE**: `Statistics.tsx` uses native `ref` prop, `forwardRef` + `displayName` removed.

### React 19 Modernization — ✅ DONE
26. ~~**Drop `forwardRef`** — replaced with React 19 native `ref` as prop in `Statistics.tsx`.~~
27. ~~**Eliminate Context layer** — removed `StatsContext`, `TodoContext`, and all 4 context files. `useStats`/`useTodos` now compose React Query hooks directly. Shared ephemeral state uses `useSyncExternalStore`.~~
28. ~~**`useSuspenseQuery` + `<Suspense>`** — replaced `useQuery` with `useSuspenseQuery` in both query hooks. `<Suspense>` boundary in `main.tsx` handles loading.~~
29. ~~**React Compiler audit** — codebase is fully compatible. No manual `useMemo`/`useCallback`/`React.memo`. Ref mutations only in effects/handlers.~~

### Features
14. **Break timer** — implement the classic Pomodoro cycle: 25 min work → 5 min short break → every 4th cycle: 15 min long break.
15. **Mobile statistics** — currently hidden on mobile (`hidden lg:block`). Show in a collapsible section or bottom sheet.
16. **Touch-friendly drag & drop** — native HTML5 drag doesn't work on mobile. Integrate `@dnd-kit` or `dnd-kit/sortable`.
17. **Error toasts / notifications** — API errors are silent to the user. Add a toast system (e.g., `sonner` or `react-hot-toast`).
18. **i18n support** — internationalization (author TODO, nice-to-have).
19. **Browser notifications** — notify when timer completes even if the tab is in the background.
20. **Keyboard shortcuts** — Space to start/pause, Escape to reset, etc.

### Reliability & Testing
21. **Fix timer drift** — replace `setInterval` counting with `Date.now()`-based elapsed time checking.
22. **Add unit tests** — zero tests exist. Start with `usePomodoro` hook and API service functions.
23. **Add E2E tests** — Playwright for the core flow: start timer → add task → complete task → session ends.

### Infrastructure
24. **Batch `reorderTodos`** — currently fires N PATCH requests. Consider a custom JSON Server route or switching to a single PUT of the full list.
25. **Design system / component library** — extract reusable Button, Card, Input components to reduce Tailwind class duplication.

## Commands

```bash
bun install          # Install deps
bun run dev          # Start dev (JSON Server on :3001 + Vite on :5173)
bun run build        # TypeScript check + Vite build
bun run lint         # ESLint
bun run preview      # Preview production build
bun run start        # Production mode (JSON Server + Vite preview)
```

## Conventions

- **No component library** — all UI is hand-crafted with Tailwind utility classes
- **Emoji icons** throughout (no icon library)
- **Glass morphism** design language with violet/purple gradients on a dark background
- **No React Context** — state is composed via hooks (`useStats`, `useTodos`) that internally use React Query + `useSyncExternalStore`
- **Hook naming**: `useQuery*` for React Query wrappers, `use*` for composing hooks consumed by components
- **Shared types** in `src/types/index.ts` — `Todo`, `Stats`, `PomodoroState`, `PomodoroControls`
- **External store pattern** — `src/stores/sessionTasksStore.ts` uses `useSyncExternalStore` for ephemeral shared state without providers
- **No barrel exports** — direct file imports throughout
