# Statistics Feature — Integration Plan (TDD)

## Overview

Rebuild the Statistics component to show **time-based metrics** (day/week/month) instead of flat all-time totals. The current `Stats` model (`totalTimeWorked`, `completedSessions`, `completedTasks`) has no timestamps, so we introduce a **stat entries** event log alongside the existing aggregate.

### Final UI

```
┌─────────────────────────────────┐
│         📊 Statistics           │
│                                 │
│  ⏱️ Time Worked     25m        │  ← today (default)
│  🍅 Sessions Done   1          │  ← today (default)
│  ✓  Tasks Done      3          │  ← today (default)
│  📝 Tasks Left      2          │  ← always simple
│                                 │
│  --- On hover (Time Worked) --- │
│  ⏱️ Time Worked                │
│     Today       25m             │
│     This Week   1h 30m          │
│     This Month  8h 15m          │
└─────────────────────────────────┘
```

- **Default**: each expandable row shows **today's** value
- **On hover**: the row expands to show day / week / month
- **Tasks Left**: not time-based, stays as a simple row

---

## Data Model Change

### New type: `StatEntry`

```ts
export type StatEntryType = "session" | "task";

export interface StatEntry {
  id: string;
  type: StatEntryType;
  value: number;       // session: duration in seconds; task: 1 (complete) or -1 (uncomplete)
  timestamp: string;   // ISO 8601
}
```

### Updated `db.json`

```json
{
  "todos": [...],
  "stats": { "totalTimeWorked": 0, "completedSessions": 0, "completedTasks": 0 },
  "statEntries": []
}
```

- `stats` (aggregate) remains for backward compatibility — it's the all-time total
- `statEntries` (event log) enables time-based filtering

### Key decisions

- **Dual write**: when a session completes or task is toggled, we update BOTH the `stats` aggregate AND create a `statEntry`. The aggregate is a denormalized cache.
- **Reset**: clearing stats resets the aggregate to zeros AND deletes all entries.
- **Task uncomplete**: creates an entry with `value: -1` so day/week/month sums remain accurate.
- **Filtering**: client-side — entries are small, JSON Server doesn't support date range queries well.

---

## Phase 0 — Preparation

### 0.1 Add `StatEntry` type to `src/types/index.ts`

### 0.2 Update `db.json` with `statEntries: []`

### 0.3 Add API functions in `src/services/api.ts`
- `getStatEntries(): Promise<StatEntry[]>`
- `createStatEntry(entry: Omit<StatEntry, "id">): Promise<StatEntry>`
- `deleteAllStatEntries(): Promise<void>`

### 0.4 Add date utils in `src/utils/dateFilters.ts`
- `isToday(timestamp: string): boolean`
- `isThisWeek(timestamp: string): boolean`
- `isThisMonth(timestamp: string): boolean`

### 0.5 Create test file `src/test/statistics.test.tsx`

---

## Phase 1 — Data Layer

### 1.1 React Query hooks for stat entries

Extend `useQueryStats.ts`:
- `useStatEntriesQuery()` — `useSuspenseQuery` for entries
- `useCreateStatEntryMutation()` — creates entry + optimistic update
- `useDeleteAllStatEntriesMutation()` — clears all entries

### 1.2 Computed aggregates in `useStats`

Extend `useStats.ts` return value:
- `dayStats: { timeWorked: number, sessions: number, tasks: number }`
- `weekStats: { timeWorked: number, sessions: number, tasks: number }`
- `monthStats: { timeWorked: number, sessions: number, tasks: number }`
- `tasksLeft: number` (moved from component to hook for testability)

### 1.3 Side effects — create entries on events

Update existing flows:
- `addCompletedSession(duration)` → also creates `{ type: "session", value: duration, timestamp: now }`
- `incrementCompletedTasks()` → also creates `{ type: "task", value: 1, timestamp: now }`
- `decrementCompletedTasks()` → also creates `{ type: "task", value: -1, timestamp: now }`

### 1.4 Reset clears entries

`resetStats()` → calls `resetStats()` (aggregate) + `deleteAllStatEntries()`

### Tests (Phase 1)

| # | Test | Expected |
|---|------|----------|
| 1 | `dayStats` with entries from today only | Sums only today's entries |
| 2 | `weekStats` with mixed dates | Sums entries from current week |
| 3 | `monthStats` with mixed dates | Sums entries from current month |
| 4 | Session entry created on `addCompletedSession` | `createStatEntry` called with type "session" |
| 5 | Task entry created on `incrementCompletedTasks` | `createStatEntry` called with type "task", value 1 |
| 6 | Task entry created on `decrementCompletedTasks` | `createStatEntry` called with type "task", value -1 |
| 7 | `resetStats` clears entries | `deleteAllStatEntries` called |
| 8 | `tasksLeft` computed correctly | workingTodos + pendingTodos count |

---

## Phase 2 — Statistics Component

### 2.1 Default display

| # | Test | Expected |
|---|------|----------|
| 1 | Renders "Time Worked" with today's value | Shows `formatTimeVerbose(dayStats.timeWorked)` |
| 2 | Renders "Sessions Done" with today's value | Shows `dayStats.sessions.toString()` |
| 3 | Renders "Tasks Done" with today's value | Shows `dayStats.tasks.toString()` |
| 4 | Renders "Tasks Left" | Shows count of non-completed todos |

### 2.2 Hover expansion

| # | Test | Expected |
|---|------|----------|
| 5 | Hover on "Time Worked" shows day/week/month | Three sub-rows appear with Today/This Week/This Month |
| 6 | Hover on "Sessions Done" shows day/week/month | Three sub-rows |
| 7 | Hover on "Tasks Done" shows day/week/month | Three sub-rows |
| 8 | Mouse leave collapses back to single row | Sub-rows disappear |
| 9 | "Tasks Left" does NOT expand on hover | No sub-rows on hover |

### 2.3 Values

| # | Test | Expected |
|---|------|----------|
| 10 | Week value >= Day value | Week includes today |
| 11 | Month value >= Week value | Month includes this week |
| 12 | Zero state shows "0m" / "0" | Graceful zero display |

### Implementation: Statistics.tsx rewrite
- `ExpandableStatRow` sub-component: manages hover state, renders default or expanded view
- `SimpleStatRow` for "Tasks Left"
- CSS transition for smooth expand/collapse

---

## Phase 3 — Settings

### 3.1 Reset confirmation

The existing `SettingsModal` already has a reset button with `window.confirm`. We update the `onResetStats` callback to also clear entries.

| # | Test | Expected |
|---|------|----------|
| 1 | Reset clears aggregate stats | `stats` reset to zeros |
| 2 | Reset clears stat entries | `statEntries` emptied |
| 3 | Confirmation required | `window.confirm` called before reset |

---

## Phase 4 — E2E Tests

New spec: `e2e/statistics.spec.ts`

1. Complete a session → verify "Time Worked" and "Sessions Done" update for today
2. Complete a task → verify "Tasks Done" updates for today
3. Hover on "Time Worked" → verify day/week/month sub-rows appear
4. Hover on "Sessions Done" → verify expansion
5. Hover on "Tasks Done" → verify expansion
6. "Tasks Left" shows correct count
7. Reset stats → verify all metrics go to zero

---

## Phase 5 — Cleanup

- Update `CLAUDE.md` with new statistics architecture
- Run full test suite

---

## Execution Order

```
Phase 0.1  →  Add StatEntry type
Phase 0.2  →  Update db.json
Phase 0.3  →  Add API functions
Phase 0.4  →  Add date filter utils
Phase 0.5  →  Create test file skeleton

Phase 1    →  Write data layer tests → Implement hooks
Phase 2    →  Write component tests  → Implement Statistics.tsx
Phase 3    →  Write settings tests   → Update reset flow
Phase 4    →  Write E2E tests        → Fix integration issues
Phase 5    →  Update CLAUDE.md
```

## Files Touched

| File | Action |
|------|--------|
| `src/types/index.ts` | Add `StatEntry`, `StatEntryType` |
| `src/services/api.ts` | Add `getStatEntries`, `createStatEntry`, `deleteAllStatEntries` |
| `src/utils/dateFilters.ts` | **New** — `isToday`, `isThisWeek`, `isThisMonth` |
| `src/hooks/useQueryStats.ts` | Add entry query/mutations |
| `src/hooks/useStats.ts` | Add computed day/week/month aggregates, create entries on events |
| `src/components/Statistics.tsx` | Full rewrite: expandable stat rows |
| `src/components/SettingsModal.tsx` | No changes (reset already calls `onResetStats`) |
| `src/test/statistics.test.tsx` | **New** — all unit tests |
| `e2e/statistics.spec.ts` | **New** — E2E tests |
| `db.json` | Add `statEntries: []` |
| `CLAUDE.md` | Update architecture docs |

## Estimated Test Count

- **Phase 1 (data layer)**: ~8 tests
- **Phase 2 (component)**: ~12 tests
- **Phase 3 (settings)**: ~3 tests
- **Phase 4 (E2E)**: ~7 tests
- **Total**: ~30 new tests
