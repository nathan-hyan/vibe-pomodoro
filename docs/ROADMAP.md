# Vibe Pomodoro — Roadmap

A consolidated view of all open TODOs, known issues, and planned features. Pick anything from here when starting a new session.

## Source Code TODOs

These are `// TODO` comments left in the codebase:

| Location | Description |
| --- | --- |
| `App.tsx:22` | Extract glow effect setup into a custom hook (`useGlowEffect`) or a `<GlowCard>` wrapper component |
| `App.tsx:43` | i18n support (nice to have) |
| `App.tsx:44` | Create a design system with reusable button components |
| `App.tsx:45` | Unify `CompletionModal` and `SettingsModal` into a reusable `Modal` shell |
| `usePomodoro.ts:20` | Extract timer logic to a separate util function |
| `usePomodoro.ts:53` | Create a modal hook with show/toggle methods |

**Resolved TODOs** (kept for reference): `formatTime` moved to utils, `onKeyPress` → `onKeyDown`, `clsx` added, `forwardRef` dropped, Context layer eliminated, providers moved to `main.tsx`.

---

## Known Issues & Technical Debt

### High Priority
- **Timer drift** — `setInterval` with 1s ticks drifts over long sessions. Replace with `Date.now()`-based elapsed time checking.
- **Statistics hidden on mobile** — `hidden lg:block` on the stats section means mobile users can't see stats. Show in a collapsible section or bottom sheet.
- **No error UI** — API errors are logged to console only. No toast/notification for the user.

### Medium Priority
- **Drag & drop doesn't work on touch devices** — native HTML5 drag events are desktop-only. Integrate `@dnd-kit` or similar.
- **`reorderTodos` fires N PATCH requests** — one per todo. Could be slow with many todos. Batch into a single PUT or custom route.
- **Import deletes & recreates all todos** — `importData` nukes existing todos and recreates them. IDs change, which can cause issues with multiple tabs open.
- **`completedTasks` stats vs todo count can diverge** — stats counts all-time completions; todos list only shows current tasks.

### Low Priority
- **No routing** — single-page app. If features grow (settings page, stats page), a router will be needed.
- **Use `crypto.randomUUID()`** — currently uses `Date.now().toString()` for todo IDs, which risks collisions.
- **Add Zod validation** — validate API responses and form inputs.

---

## Planned Features

### 🍅 Break Timer
Implement the classic Pomodoro cycle:
- 25 min work → 5 min short break
- Every 4th cycle → 15 min long break
- Visual indicator for current cycle position

### 📱 Mobile Statistics
Stats are currently hidden on small screens. Options:
- Collapsible/accordion section below the todo list
- Bottom sheet overlay
- Separate tab/view

### 🖱️ Touch-Friendly Drag & Drop
Replace native HTML5 drag with `@dnd-kit` or `@dnd-kit/sortable` for mobile/touch support.

### 🔔 Browser Notifications
Notify when the timer completes even if the tab is in the background. Use the Notifications API with permission request.

### ⌨️ Keyboard Shortcuts
- **Space** — start/pause timer
- **Escape** — reset timer
- **N** — focus new task input
- Consider a help overlay (e.g., `?` key)

### 🌐 i18n Support
Internationalization — nice to have. No specific library chosen yet.

### 🚨 Error Toasts / Notifications
API errors are currently silent. Add a toast system (e.g., `sonner` or `react-hot-toast`).

---

## Code Quality Improvements

### Unify Modal Components
`CompletionModal` and `SettingsModal` share the same backdrop/container pattern. Extract a reusable `<Modal>` shell component.

### Extract Glow Effect
The `useEffect` + refs pattern in `App.tsx` could become a `useGlowEffect(ref)` hook or a `<GlowCard>` wrapper component.

### Design System / Component Library
Extract reusable `Button`, `Card`, `Input` components to reduce Tailwind class duplication across the app.

### Batch Reorder API
`reorderTodos` currently fires N individual PATCH requests. Consider a custom JSON Server route or switching to a single PUT of the full list.

---

## What's Already Done ✅

For context on what's been completed (don't re-do these):

- **Quick wins**: deprecated `onKeyPress` → `onKeyDown`, removed `apisauce`, removed looping alarm, added `clsx`, moved `formatTime` to utils, fixed `VITE_API_URL`, deduplicated `Stats` interface
- **React 19 modernization**: dropped `forwardRef`, eliminated Context layer, `useSuspenseQuery` + `<Suspense>`, React Compiler audit
- **Focus Tasks feature**: three-section layout (working/pending/completed), inline edit, promote/demote, drag & drop reorder
- **Statistics feature**: `statEntries` event log, time-based metrics (today/week/month), expandable stat rows
- **Testing infrastructure**: Vitest (97 unit tests) + Playwright (28 E2E tests)
- **Bug fixes**: timer completion page refresh, Vite HMR on db.json, time adjustment while running
