# Focus Tasks — Integration Plan (TDD)

## Overview

Rebuild the Focus Tasks feature from scratch using Test-Driven Development. The existing add/mark-complete partially works, but reordering is broken, edit is missing, and the layout is a flat list. This plan introduces a **three-section layout** driven by a `status` enum, replacing the old `completed: boolean` model.

### Three-Section Layout

```
┌─────────────────────────────────┐
│  --- Currently working on ---   │
│  ☐ This codebase                │
│  ☐ Make it work                 │
│                                 │
│  --- Next tasks ---             │
│  ☐ Buy milk                    │
│  ☐ Do whatever                 │
│                                 │
│  --- Finished ---               │
│  ☑ Sleep                        │
└─────────────────────────────────┘
```

- **Currently working on** — tasks actively being worked on right now
- **Next tasks** — queued tasks, ordered by priority (drag-and-drop)
- **Finished** — completed tasks, shown at the bottom

## Requirements

1. **Add** a task (lands in "Next tasks" by default)
2. **Delete** a task (from any section)
3. **Edit** a task inline (double-click)
4. **Mark as completed** → moves to "Finished"
5. **Unmark from completed** → moves back to "Next tasks"
6. **Promote to working** → moves to "Currently working on"
7. **Demote from working** → moves back to "Next tasks"
8. **Three-section layout** — Currently working on / Next tasks / Finished
9. **Reorder** tasks via drag-and-drop within "Currently working on" and "Next tasks" sections
10. **Chime** on task completion (Web Audio API)
11. **Stats update** — "Tasks Done" and "Tasks Left" in Statistics reflect todo state

---

## Data Model Change

### Old model
```ts
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}
```

### New model
```ts
type TodoStatus = "working" | "pending" | "completed";

interface Todo {
  id: string;
  text: string;
  status: TodoStatus;
  order: number;
}
```

**Key decisions:**
- `completed: boolean` → `status: TodoStatus` — a single field drives both section placement and completion state
- `order: number` — drives sort order within each section
- Helper getters: `isCompleted` = `status === "completed"`, etc. (used in `useTodos`)
- **Migration**: existing todos with `completed: true` → `status: "completed"`, `completed: false` → `status: "pending"`

---

## Phase 0 — Preparation (no tests yet)

### 0.1 Update `Todo` type
Replace `completed: boolean` with `status: TodoStatus` and add `order: number` in `src/types/index.ts`.

```ts
export type TodoStatus = "working" | "pending" | "completed";

export interface Todo {
  id: string;
  text: string;
  status: TodoStatus;
  order: number;
}
```

### 0.2 Seed `db.json`
Reset to a clean state with the new schema:

```json
{
  "todos": [
    { "id": "1", "text": "Sample task", "status": "pending", "order": 0 }
  ],
  "stats": { "totalTimeWorked": 0, "completedSessions": 0, "completedTasks": 0 }
}
```

### 0.3 Create test file
Create `src/test/todos.test.tsx` — dedicated test suite for Focus Tasks.

### 0.4 Update API layer
- `api.ts`: Remove references to `completed` boolean, work with `status` field
- `getTodos()`: Sort client-side by `order` after fetch
- `createTodo()`: Accept `status` + `order` fields

### 0.5 Update all consumers of `todo.completed`
Grep for `todo.completed`, `.completed`, `completed:` across the codebase and update to use `todo.status`:
- `useTodos.ts` — `toggleTodo` logic
- `useQueryTodos.ts` — optimistic update in `useCreateTodoMutation`
- `Statistics.tsx` — filter logic
- `TodoList.tsx` — checkbox / styling
- `CompletionModal.tsx` — if it references todos

---

## Phase 1 — Data Layer (useTodos hook)

All tests mock the React Query layer and verify the **logic** in `useTodos`.

### Test strategy
Render a test harness component that calls `useTodos()` and exposes its return value. Mock `useQueryTodos` hooks and `useStats`.

### 1.1 addTodo
| Test | Expected |
|------|----------|
| `addTodo("Buy milk")` | Calls mutate with `{ text: "Buy milk", status: "pending", order: <next> }` |
| `addTodo("  spaced  ")` | Trims to `"spaced"` |
| `addTodo("")` | Does NOT call mutate |
| `addTodo("   ")` | Does NOT call mutate |

### 1.2 deleteTodo
| Test | Expected |
|------|----------|
| `deleteTodo("abc")` | Calls `deleteTodoMutation.mutate("abc")` |
| Delete a "working" task | Also calls mutate (no special restriction) |
| Delete a "completed" task | Also calls mutate |

### 1.3 editTodo *(new)*
| Test | Expected |
|------|----------|
| `editTodo("abc", "New text")` | Calls `updateTodoMutation.mutate({ id: "abc", updates: { text: "New text" } })` |
| `editTodo("abc", "  trimmed  ")` | Trims to `"trimmed"` |
| `editTodo("abc", "")` | Does NOT call mutate (reject empty) |

### 1.4 completeTodo / uncompleteTodo *(replaces toggleTodo)*
| Test | Expected |
|------|----------|
| `completeTodo(id)` on a "pending" task | Updates status to `"completed"`, plays chime, increments stats, adds session task |
| `completeTodo(id)` on a "working" task | Same — updates to `"completed"`, plays chime, increments stats |
| `uncompleteTodo(id)` on a "completed" task | Updates status to `"pending"`, decrements stats, removes session task |
| `completeTodo` on non-existent id | No-op |

### 1.5 promoteToWorking / demoteFromWorking *(new)*
| Test | Expected |
|------|----------|
| `promoteToWorking(id)` on a "pending" task | Updates status to `"working"` |
| `demoteFromWorking(id)` on a "working" task | Updates status to `"pending"` |
| `promoteToWorking(id)` on a "completed" task | No-op (must unmark first) |

### 1.6 Computed section arrays *(new exports)*
| Test | Expected |
|------|----------|
| Mixed list | `workingTodos` = `status === "working"`, sorted by `order` ASC |
| Mixed list | `pendingTodos` = `status === "pending"`, sorted by `order` ASC |
| Mixed list | `completedTodos` = `status === "completed"`, sorted by `order` ASC |

### 1.7 reorderTodos *(fix)*
| Test | Expected |
|------|----------|
| `reorderTodos(0, 2)` within pending todos | Reorders, updates `order` on each, calls `reorderTodosMutation.mutate` |
| Reorder within working todos | Same behavior |
| Cannot reorder completed todos | No-op or error |

### Implementation changes
- **`src/types/index.ts`**: `TodoStatus` type + updated `Todo` interface
- **`useTodos.ts`**: Replace `toggleTodo` with `completeTodo`/`uncompleteTodo`, add `promoteToWorking`/`demoteFromWorking`, add `editTodo`, export `workingTodos`/`pendingTodos`/`completedTodos`
- **`useQueryTodos.ts`**: Update optimistic update in create mutation (use `status` not `completed`), `onSettled` for reorder → `refetchType: "none"`
- **`api.ts`**: `getTodos` → sort by `order` client-side. `createTodo` → accept `status` + `order`.

---

## Phase 2 — TodoList Component (UI)

Tests render `<TodoList />` with mocked `useTodos` hook and verify DOM output + user interactions.

### 2.1 Three-section rendering
| Test | Expected |
|------|----------|
| No todos at all | Shows empty state message |
| Only working todos | Shows "Currently working on" section, no other sections |
| Only pending todos | Shows "Next tasks" section, no other sections |
| Only completed todos | Shows "Finished" section, no other sections |
| Mixed (all three) | Three sections in order: "Currently working on" → "Next tasks" → "Finished" |
| Empty section is hidden | If no working todos, "Currently working on" header is not rendered |

### 2.2 Adding tasks
| Test | Expected |
|------|----------|
| Type text + press Enter | Calls `addTodo(text)`, clears input |
| Type text + click Add button | Calls `addTodo(text)`, clears input |
| Press Enter with empty input | Does NOT call `addTodo` |

### 2.3 Deleting tasks
| Test | Expected |
|------|----------|
| Click delete (✕) on any task | Calls `deleteTodo(id)` |
| Each todo row has a delete button | Button exists per row |

### 2.4 Editing tasks *(new UI)*
| Test | Expected |
|------|----------|
| Double-click task text | Enters edit mode: text replaced by input pre-filled with current text |
| Edit mode + Enter | Calls `editTodo(id, newText)`, exits edit mode |
| Edit mode + Escape | Exits edit mode, reverts to original text |
| Edit mode + blur | Saves edit (same as Enter) |
| Edit mode + clear text + Enter | Reverts to original (don't save empty) |

### 2.5 Completing / uncompleting
| Test | Expected |
|------|----------|
| Click checkbox on working/pending task | Calls `completeTodo(id)` |
| Click checkbox on completed task | Calls `uncompleteTodo(id)` |
| Completed tasks show line-through | CSS class applied when `status === "completed"` |

### 2.6 Promote / demote
| Test | Expected |
|------|----------|
| Click "promote" action on pending task | Calls `promoteToWorking(id)` — task moves to "Currently working on" |
| Click "demote" action on working task | Calls `demoteFromWorking(id)` — task moves to "Next tasks" |
| No promote/demote actions on completed tasks | Buttons not rendered for completed section |

### 2.7 Drag-and-drop reordering
| Test | Expected |
|------|----------|
| Drag task within "Currently working on" | Calls `reorderTodos(from, to)` |
| Drag task within "Next tasks" | Calls `reorderTodos(from, to)` |
| Completed tasks are NOT draggable | `draggable={false}` for completed todos |

### Implementation: TodoList.tsx rewrite
- Consume `workingTodos`, `pendingTodos`, `completedTodos` from `useTodos`
- Render three sections conditionally (hide empty sections)
- Each section has a header: "Currently working on" / "Next tasks" / "Finished"
- Task row actions: checkbox (complete/uncomplete), promote/demote button, delete button, double-click to edit
- Inline edit mode: local state (`editingId`, `editText`)
- Drag-and-drop within working and pending sections, disabled for completed

---

## Phase 3 — Integration & Polish

### 3.1 Statistics
| Test | Expected |
|------|----------|
| "Tasks Done" | Equals `completedTodos.length` |
| "Tasks Left" | Equals `workingTodos.length + pendingTodos.length` |

**Update required**: `Statistics.tsx` currently uses `todos.filter(t => t.completed)`. Must change to `todos.filter(t => t.status === "completed")`.

### 3.2 Chime
| Test | Expected |
|------|----------|
| Completing a task plays chime | `playTaskCompleteChime` called |
| Uncompleting does NOT play chime | Not called |
| Promoting/demoting does NOT play chime | Not called |

### 3.3 E2E Tests (Playwright)
New spec: `e2e/todos.spec.ts`

1. Add a task → appears in "Next tasks"
2. Promote task → moves to "Currently working on"
3. Demote task → moves back to "Next tasks"
4. Complete task → moves to "Finished"
5. Uncomplete task → moves back to "Next tasks"
6. Edit a task via double-click
7. Delete a task
8. Verify Statistics updates
9. Add multiple tasks, reorder within "Next tasks"

---

## Phase 4 — Cleanup

- Remove dead code (`completed` boolean references, old `toggleTodo`)
- Migrate db.json data (script or manual)
- Update `CLAUDE.md` with final architecture
- Run full test suite (`bun run test:unit` + `bun run test:e2e`)

---

## Execution Order

```
Phase 0.1  →  Update Todo type (status enum + order)
Phase 0.2  →  Seed db.json with new schema
Phase 0.3  →  Create test file skeleton
Phase 0.4  →  Update API layer for status field
Phase 0.5  →  Grep & update all `completed` boolean refs

Phase 1.1  →  Write addTodo tests            →  Implement
Phase 1.2  →  Write deleteTodo tests          →  Implement
Phase 1.3  →  Write editTodo tests            →  Implement
Phase 1.4  →  Write complete/uncomplete tests →  Implement
Phase 1.5  →  Write promote/demote tests      →  Implement
Phase 1.6  →  Write computed section tests    →  Implement
Phase 1.7  →  Write reorder tests             →  Implement / fix

Phase 2.1  →  Write 3-section rendering tests →  Implement sectioned layout
Phase 2.2  →  Write add-task UI tests         →  Implement (mostly done)
Phase 2.3  →  Write delete UI tests           →  Implement improved UX
Phase 2.4  →  Write edit UI tests             →  Implement inline editing
Phase 2.5  →  Write complete/uncomplete UI    →  Implement
Phase 2.6  →  Write promote/demote UI tests   →  Implement
Phase 2.7  →  Write drag-drop tests           →  Implement fixed reorder

Phase 3.1  →  Write stats tests              →  Update Statistics.tsx
Phase 3.2  →  Write chime tests              →  Verify
Phase 3.3  →  Write E2E tests               →  Fix integration issues

Phase 4    →  Cleanup + CLAUDE.md update
```

## Files Touched

| File | Action |
|------|--------|
| `src/types/index.ts` | `TodoStatus` type, replace `completed` with `status` + `order` |
| `src/services/api.ts` | Sort by `order`, use `status` field, remove `completed` refs |
| `src/hooks/useQueryTodos.ts` | Update optimistic updates for `status`, fix reorder `onSettled` |
| `src/hooks/useTodos.ts` | Replace `toggleTodo` → `completeTodo`/`uncompleteTodo`, add `promoteToWorking`/`demoteFromWorking`, add `editTodo`, export 3 section arrays |
| `src/components/TodoList.tsx` | Full rewrite: 3 sections, inline edit, promote/demote, fixed drag |
| `src/components/Statistics.tsx` | Update filters: `t.completed` → `t.status === "completed"` |
| `src/stores/sessionTasksStore.ts` | No changes expected |
| `src/test/todos.test.tsx` | **New** — all unit tests for Focus Tasks |
| `e2e/todos.spec.ts` | **New** — E2E tests for Focus Tasks |
| `db.json` | Migrate to new schema |
| `CLAUDE.md` | Update architecture docs |

## Estimated Test Count

- **Phase 1 (data layer)**: ~18 tests
- **Phase 2 (component)**: ~22 tests
- **Phase 3 (integration)**: ~5 unit + ~9 E2E
- **Total**: ~54 new tests
