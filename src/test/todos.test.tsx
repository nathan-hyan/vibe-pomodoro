import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { TodoList } from "../components/TodoList";
import type { Todo } from "../types";

// ============ MOCKS ============

const {
  mockCreateMutate,
  mockUpdateMutate,
  mockDeleteMutate,
  mockReorderMutate,
  mockIncrementCompletedTasks,
  mockDecrementCompletedTasks,
  mockAddSessionTask,
  mockRemoveSessionTask,
  mockPlayTaskCompleteChime,
} = vi.hoisted(() => ({
  mockCreateMutate: vi.fn(),
  mockUpdateMutate: vi.fn(),
  mockDeleteMutate: vi.fn(),
  mockReorderMutate: vi.fn(),
  mockIncrementCompletedTasks: vi.fn(),
  mockDecrementCompletedTasks: vi.fn(),
  mockAddSessionTask: vi.fn(),
  mockRemoveSessionTask: vi.fn(),
  mockPlayTaskCompleteChime: vi.fn(),
}));

// Shared mutable todos array — tests set this before rendering
let mockTodos: Todo[] = [];

vi.mock("../hooks/useQueryTodos", () => ({
  useTodosQuery: () => ({ data: mockTodos }),
  useCreateTodoMutation: () => ({ mutate: mockCreateMutate }),
  useUpdateTodoMutation: () => ({ mutate: mockUpdateMutate }),
  useDeleteTodoMutation: () => ({ mutate: mockDeleteMutate }),
  useReorderTodosMutation: () => ({ mutate: mockReorderMutate }),
  todoKeys: {
    all: ["todos"],
    lists: () => ["todos", "list"],
    list: (f?: string) => ["todos", "list", { filters: f }],
    details: () => ["todos", "detail"],
    detail: (id: string) => ["todos", "detail", id],
  },
}));

vi.mock("../hooks/useStats", () => ({
  useStats: () => ({
    stats: { totalTimeWorked: 0, completedSessions: 0, completedTasks: 0 },
    sessionCompletedTasks: [],
    addCompletedSession: vi.fn(),
    incrementCompletedTasks: mockIncrementCompletedTasks,
    decrementCompletedTasks: mockDecrementCompletedTasks,
    addSessionTask: mockAddSessionTask,
    removeSessionTask: mockRemoveSessionTask,
    clearSessionTasks: vi.fn(),
    resetStats: vi.fn(),
  }),
}));

vi.mock("../utils/alarmSound", () => ({
  playTaskCompleteChime: mockPlayTaskCompleteChime,
  playAlarmSoundOnce: vi.fn(),
}));

// ============ HELPERS ============

function setTodos(todos: Todo[]) {
  mockTodos = todos;
}

function makeTodo(overrides: Partial<Todo> & { id: string }): Todo {
  return {
    text: "Test task",
    status: "pending",
    order: 0,
    ...overrides,
  };
}

// ============ PHASE 1 — DATA LAYER (useTodos hook) ============
// We test the hook indirectly through <TodoList /> which calls useTodos().
// For addTodo, we interact with the input + Add button.
// For other operations, we interact with the todo row actions.

describe("Phase 1 — useTodos data layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTodos = [];
  });

  // --- 1.1 addTodo ---
  describe("1.1 addTodo", () => {
    it("creates a pending todo with trimmed text", () => {
      setTodos([]);
      render(<TodoList />);

      const input = screen.getByPlaceholderText("What are you working on?");
      fireEvent.change(input, { target: { value: "Buy milk" } });
      fireEvent.click(screen.getByRole("button", { name: "Add" }));

      expect(mockCreateMutate).toHaveBeenCalledWith({
        text: "Buy milk",
        status: "pending",
        order: 0,
      });
    });

    it("trims whitespace from text", () => {
      setTodos([]);
      render(<TodoList />);

      const input = screen.getByPlaceholderText("What are you working on?");
      fireEvent.change(input, { target: { value: "  spaced  " } });
      fireEvent.click(screen.getByRole("button", { name: "Add" }));

      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({ text: "spaced" })
      );
    });

    it("does NOT create when text is empty", () => {
      setTodos([]);
      render(<TodoList />);

      fireEvent.click(screen.getByRole("button", { name: "Add" }));
      expect(mockCreateMutate).not.toHaveBeenCalled();
    });

    it("does NOT create when text is only whitespace", () => {
      setTodos([]);
      render(<TodoList />);

      const input = screen.getByPlaceholderText("What are you working on?");
      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.click(screen.getByRole("button", { name: "Add" }));

      expect(mockCreateMutate).not.toHaveBeenCalled();
    });

    it("assigns order as max + 1 when todos exist", () => {
      setTodos([
        makeTodo({ id: "1", order: 0 }),
        makeTodo({ id: "2", order: 5 }),
      ]);
      render(<TodoList />);

      const input = screen.getByPlaceholderText("What are you working on?");
      fireEvent.change(input, { target: { value: "New task" } });
      fireEvent.click(screen.getByRole("button", { name: "Add" }));

      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({ order: 6 })
      );
    });

    it("clears input after adding", () => {
      setTodos([]);
      render(<TodoList />);

      const input = screen.getByPlaceholderText("What are you working on?");
      fireEvent.change(input, { target: { value: "Buy milk" } });
      fireEvent.click(screen.getByRole("button", { name: "Add" }));

      expect(input).toHaveValue("");
    });

    it("adds via Enter key", () => {
      setTodos([]);
      render(<TodoList />);

      const input = screen.getByPlaceholderText("What are you working on?");
      fireEvent.change(input, { target: { value: "Enter task" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({ text: "Enter task" })
      );
      expect(input).toHaveValue("");
    });
  });

  // --- 1.2 deleteTodo ---
  describe("1.2 deleteTodo", () => {
    it("calls deleteTodoMutation.mutate with the id", () => {
      setTodos([makeTodo({ id: "abc", text: "Delete me" })]);
      render(<TodoList />);

      fireEvent.click(screen.getByTitle("Delete task"));
      expect(mockDeleteMutate).toHaveBeenCalledWith("abc");
    });

    it("deletes a working task", () => {
      setTodos([makeTodo({ id: "w1", text: "Working task", status: "working" })]);
      render(<TodoList />);

      fireEvent.click(screen.getByTitle("Delete task"));
      expect(mockDeleteMutate).toHaveBeenCalledWith("w1");
    });

    it("deletes a completed task", () => {
      setTodos([makeTodo({ id: "c1", text: "Done task", status: "completed" })]);
      render(<TodoList />);

      fireEvent.click(screen.getByTitle("Delete task"));
      expect(mockDeleteMutate).toHaveBeenCalledWith("c1");
    });
  });

  // --- 1.3 editTodo ---
  describe("1.3 editTodo", () => {
    it("updates text via double-click + Enter", () => {
      setTodos([makeTodo({ id: "e1", text: "Original" })]);
      render(<TodoList />);

      fireEvent.doubleClick(screen.getByText("Original"));

      const editInput = screen.getByDisplayValue("Original");
      fireEvent.change(editInput, { target: { value: "Updated" } });
      fireEvent.keyDown(editInput, { key: "Enter" });

      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: "e1",
        updates: { text: "Updated" },
      });
    });

    it("trims whitespace when editing", () => {
      setTodos([makeTodo({ id: "e2", text: "Original" })]);
      render(<TodoList />);

      fireEvent.doubleClick(screen.getByText("Original"));

      const editInput = screen.getByDisplayValue("Original");
      fireEvent.change(editInput, { target: { value: "  trimmed  " } });
      fireEvent.keyDown(editInput, { key: "Enter" });

      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: "e2",
        updates: { text: "trimmed" },
      });
    });

    it("does NOT update when edit text is empty", () => {
      setTodos([makeTodo({ id: "e3", text: "Original" })]);
      render(<TodoList />);

      fireEvent.doubleClick(screen.getByText("Original"));

      const editInput = screen.getByDisplayValue("Original");
      fireEvent.change(editInput, { target: { value: "" } });
      fireEvent.keyDown(editInput, { key: "Enter" });

      expect(mockUpdateMutate).not.toHaveBeenCalled();
    });

    it("cancels edit on Escape", () => {
      setTodos([makeTodo({ id: "e4", text: "Original" })]);
      render(<TodoList />);

      fireEvent.doubleClick(screen.getByText("Original"));

      const editInput = screen.getByDisplayValue("Original");
      fireEvent.change(editInput, { target: { value: "Changed" } });
      fireEvent.keyDown(editInput, { key: "Escape" });

      // Should exit edit mode without calling mutate
      expect(mockUpdateMutate).not.toHaveBeenCalled();
      expect(screen.getByText("Original")).toBeInTheDocument();
    });

    it("saves edit on blur", () => {
      setTodos([makeTodo({ id: "e5", text: "Original" })]);
      render(<TodoList />);

      fireEvent.doubleClick(screen.getByText("Original"));

      const editInput = screen.getByDisplayValue("Original");
      fireEvent.change(editInput, { target: { value: "Blurred" } });
      fireEvent.blur(editInput);

      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: "e5",
        updates: { text: "Blurred" },
      });
    });

    it("does not allow editing completed tasks", () => {
      setTodos([makeTodo({ id: "e6", text: "Done task", status: "completed" })]);
      render(<TodoList />);

      fireEvent.doubleClick(screen.getByText("Done task"));

      // Should not enter edit mode
      expect(screen.queryByDisplayValue("Done task")).not.toBeInTheDocument();
    });
  });

  // --- 1.4 completeTodo / uncompleteTodo ---
  describe("1.4 completeTodo / uncompleteTodo", () => {
    it("marks a pending task as completed + chime + stats", () => {
      setTodos([makeTodo({ id: "t1", text: "Pending task", status: "pending" })]);
      render(<TodoList />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: "t1",
        updates: { status: "completed" },
      });
      expect(mockPlayTaskCompleteChime).toHaveBeenCalledOnce();
      expect(mockIncrementCompletedTasks).toHaveBeenCalledOnce();
      expect(mockAddSessionTask).toHaveBeenCalledWith("Pending task");
    });

    it("marks a working task as completed + chime + stats", () => {
      setTodos([makeTodo({ id: "t2", text: "Working task", status: "working" })]);
      render(<TodoList />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: "t2",
        updates: { status: "completed" },
      });
      expect(mockPlayTaskCompleteChime).toHaveBeenCalledOnce();
      expect(mockIncrementCompletedTasks).toHaveBeenCalledOnce();
      expect(mockAddSessionTask).toHaveBeenCalledWith("Working task");
    });

    it("unmarks a completed task → pending + decrements stats", () => {
      setTodos([makeTodo({ id: "t3", text: "Done task", status: "completed" })]);
      render(<TodoList />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: "t3",
        updates: { status: "pending" },
      });
      expect(mockDecrementCompletedTasks).toHaveBeenCalledOnce();
      expect(mockRemoveSessionTask).toHaveBeenCalledWith("Done task");
    });

    it("does NOT play chime when uncompleting", () => {
      setTodos([makeTodo({ id: "t4", text: "Done task", status: "completed" })]);
      render(<TodoList />);

      fireEvent.click(screen.getByRole("checkbox"));
      expect(mockPlayTaskCompleteChime).not.toHaveBeenCalled();
    });
  });

  // --- 1.5 promoteToWorking / demoteFromWorking ---
  describe("1.5 promoteToWorking / demoteFromWorking", () => {
    it("promotes a pending task to working", () => {
      setTodos([makeTodo({ id: "p1", text: "Promote me", status: "pending" })]);
      render(<TodoList />);

      fireEvent.click(screen.getByTitle("Move to Currently working on"));

      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: "p1",
        updates: { status: "working" },
      });
    });

    it("demotes a working task to pending", () => {
      setTodos([makeTodo({ id: "d1", text: "Demote me", status: "working" })]);
      render(<TodoList />);

      fireEvent.click(screen.getByTitle("Move to Next tasks"));

      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: "d1",
        updates: { status: "pending" },
      });
    });

    it("does not show promote button for completed tasks", () => {
      setTodos([makeTodo({ id: "c1", text: "Done", status: "completed" })]);
      render(<TodoList />);

      expect(screen.queryByTitle("Move to Currently working on")).not.toBeInTheDocument();
      expect(screen.queryByTitle("Move to Next tasks")).not.toBeInTheDocument();
    });

    it("does not play chime when promoting/demoting", () => {
      setTodos([makeTodo({ id: "p2", text: "Promote me", status: "pending" })]);
      render(<TodoList />);

      fireEvent.click(screen.getByTitle("Move to Currently working on"));
      expect(mockPlayTaskCompleteChime).not.toHaveBeenCalled();
    });
  });

  // --- 1.6 Computed section arrays ---
  describe("1.6 computed section arrays", () => {
    it("splits todos into three sections", () => {
      setTodos([
        makeTodo({ id: "w1", text: "Working 1", status: "working", order: 0 }),
        makeTodo({ id: "p1", text: "Pending 1", status: "pending", order: 0 }),
        makeTodo({ id: "c1", text: "Completed 1", status: "completed", order: 0 }),
      ]);
      render(<TodoList />);

      // All three section headers should be visible
      expect(screen.getByText("Currently working on")).toBeInTheDocument();
      expect(screen.getByText("Next tasks")).toBeInTheDocument();
      expect(screen.getByText("Finished")).toBeInTheDocument();
    });

    it("sorts within sections by order", () => {
      setTodos([
        makeTodo({ id: "p2", text: "Second", status: "pending", order: 2 }),
        makeTodo({ id: "p1", text: "First", status: "pending", order: 1 }),
        makeTodo({ id: "p3", text: "Third", status: "pending", order: 3 }),
      ]);
      render(<TodoList />);

      const section = screen.getByText("Next tasks").closest("div")!;
      const items = within(section).getAllByText(/First|Second|Third/);
      expect(items.map((el) => el.textContent)).toEqual(["First", "Second", "Third"]);
    });
  });
});

// ============ PHASE 2 — TODOLIST COMPONENT (UI) ============

describe("Phase 2 — TodoList component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTodos = [];
  });

  // --- 2.1 Three-section rendering ---
  describe("2.1 three-section rendering", () => {
    it("shows empty state when no todos", () => {
      setTodos([]);
      render(<TodoList />);

      expect(screen.getByText("Add tasks to track your focus session")).toBeInTheDocument();
    });

    it("shows only 'Currently working on' when only working todos", () => {
      setTodos([makeTodo({ id: "w1", text: "Work", status: "working" })]);
      render(<TodoList />);

      expect(screen.getByText("Currently working on")).toBeInTheDocument();
      expect(screen.queryByText("Next tasks")).not.toBeInTheDocument();
      expect(screen.queryByText("Finished")).not.toBeInTheDocument();
    });

    it("shows only 'Next tasks' when only pending todos", () => {
      setTodos([makeTodo({ id: "p1", text: "Pending", status: "pending" })]);
      render(<TodoList />);

      expect(screen.getByText("Next tasks")).toBeInTheDocument();
      expect(screen.queryByText("Currently working on")).not.toBeInTheDocument();
      expect(screen.queryByText("Finished")).not.toBeInTheDocument();
    });

    it("shows only 'Finished' when only completed todos", () => {
      setTodos([makeTodo({ id: "c1", text: "Done", status: "completed" })]);
      render(<TodoList />);

      expect(screen.getByText("Finished")).toBeInTheDocument();
      expect(screen.queryByText("Currently working on")).not.toBeInTheDocument();
      expect(screen.queryByText("Next tasks")).not.toBeInTheDocument();
    });

    it("shows all three sections in order when mixed", () => {
      setTodos([
        makeTodo({ id: "w1", text: "Working", status: "working", order: 0 }),
        makeTodo({ id: "p1", text: "Pending", status: "pending", order: 0 }),
        makeTodo({ id: "c1", text: "Completed", status: "completed", order: 0 }),
      ]);
      render(<TodoList />);

      const headings = screen.getAllByRole("heading", { level: 3 });
      expect(headings.map((h) => h.textContent)).toEqual([
        "Currently working on",
        "Next tasks",
        "Finished",
      ]);
    });

    it("hides empty sections", () => {
      setTodos([
        makeTodo({ id: "p1", text: "Pending", status: "pending", order: 0 }),
        makeTodo({ id: "c1", text: "Done", status: "completed", order: 0 }),
      ]);
      render(<TodoList />);

      expect(screen.queryByText("Currently working on")).not.toBeInTheDocument();
      expect(screen.getByText("Next tasks")).toBeInTheDocument();
      expect(screen.getByText("Finished")).toBeInTheDocument();
    });
  });

  // --- 2.2 Adding tasks (UI) ---
  describe("2.2 adding tasks (UI)", () => {
    it("adds via Enter key and clears input", () => {
      setTodos([]);
      render(<TodoList />);

      const input = screen.getByPlaceholderText("What are you working on?");
      fireEvent.change(input, { target: { value: "New task" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockCreateMutate).toHaveBeenCalled();
      expect(input).toHaveValue("");
    });

    it("adds via Add button and clears input", () => {
      setTodos([]);
      render(<TodoList />);

      const input = screen.getByPlaceholderText("What are you working on?");
      fireEvent.change(input, { target: { value: "New task" } });
      fireEvent.click(screen.getByRole("button", { name: "Add" }));

      expect(mockCreateMutate).toHaveBeenCalled();
      expect(input).toHaveValue("");
    });

    it("does NOT add with empty input", () => {
      setTodos([]);
      render(<TodoList />);

      fireEvent.keyDown(
        screen.getByPlaceholderText("What are you working on?"),
        { key: "Enter" }
      );

      expect(mockCreateMutate).not.toHaveBeenCalled();
    });
  });

  // --- 2.3 Deleting tasks (UI) ---
  describe("2.3 deleting tasks (UI)", () => {
    it("each todo row has a delete button", () => {
      setTodos([
        makeTodo({ id: "1", text: "Task 1", order: 0 }),
        makeTodo({ id: "2", text: "Task 2", order: 1 }),
      ]);
      render(<TodoList />);

      const deleteButtons = screen.getAllByTitle("Delete task");
      expect(deleteButtons).toHaveLength(2);
    });

    it("calls deleteTodo on click", () => {
      setTodos([makeTodo({ id: "del1", text: "Delete me" })]);
      render(<TodoList />);

      fireEvent.click(screen.getByTitle("Delete task"));
      expect(mockDeleteMutate).toHaveBeenCalledWith("del1");
    });
  });

  // --- 2.4 Editing tasks (UI) ---
  describe("2.4 editing tasks (UI)", () => {
    it("enters edit mode on double-click", () => {
      setTodos([makeTodo({ id: "1", text: "Edit me" })]);
      render(<TodoList />);

      fireEvent.doubleClick(screen.getByText("Edit me"));
      expect(screen.getByDisplayValue("Edit me")).toBeInTheDocument();
    });

    it("saves on Enter and exits edit mode", () => {
      setTodos([makeTodo({ id: "1", text: "Edit me" })]);
      render(<TodoList />);

      fireEvent.doubleClick(screen.getByText("Edit me"));
      const input = screen.getByDisplayValue("Edit me");
      fireEvent.change(input, { target: { value: "Edited" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: "1",
        updates: { text: "Edited" },
      });
      // Should exit edit mode
      expect(screen.queryByDisplayValue("Edited")).not.toBeInTheDocument();
    });

    it("cancels on Escape and reverts", () => {
      setTodos([makeTodo({ id: "1", text: "Original" })]);
      render(<TodoList />);

      fireEvent.doubleClick(screen.getByText("Original"));
      const input = screen.getByDisplayValue("Original");
      fireEvent.change(input, { target: { value: "Changed" } });
      fireEvent.keyDown(input, { key: "Escape" });

      expect(mockUpdateMutate).not.toHaveBeenCalled();
      expect(screen.getByText("Original")).toBeInTheDocument();
    });

    it("saves on blur", () => {
      setTodos([makeTodo({ id: "1", text: "Blur me" })]);
      render(<TodoList />);

      fireEvent.doubleClick(screen.getByText("Blur me"));
      const input = screen.getByDisplayValue("Blur me");
      fireEvent.change(input, { target: { value: "Blurred" } });
      fireEvent.blur(input);

      expect(mockUpdateMutate).toHaveBeenCalledWith({
        id: "1",
        updates: { text: "Blurred" },
      });
    });

    it("does not save empty text", () => {
      setTodos([makeTodo({ id: "1", text: "Not empty" })]);
      render(<TodoList />);

      fireEvent.doubleClick(screen.getByText("Not empty"));
      const input = screen.getByDisplayValue("Not empty");
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockUpdateMutate).not.toHaveBeenCalled();
    });
  });

  // --- 2.5 Completing / uncompleting (UI) ---
  describe("2.5 completing / uncompleting (UI)", () => {
    it("checkbox is unchecked for pending task", () => {
      setTodos([makeTodo({ id: "1", text: "Pending", status: "pending" })]);
      render(<TodoList />);

      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("checkbox is unchecked for working task", () => {
      setTodos([makeTodo({ id: "1", text: "Working", status: "working" })]);
      render(<TodoList />);

      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("checkbox is checked for completed task", () => {
      setTodos([makeTodo({ id: "1", text: "Done", status: "completed" })]);
      render(<TodoList />);

      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("completed task has line-through styling", () => {
      setTodos([makeTodo({ id: "1", text: "Done task", status: "completed" })]);
      render(<TodoList />);

      expect(screen.getByText("Done task")).toHaveClass("line-through");
    });
  });

  // --- 2.6 Promote / demote (UI) ---
  describe("2.6 promote / demote (UI)", () => {
    it("shows promote button for pending tasks", () => {
      setTodos([makeTodo({ id: "1", text: "Pending", status: "pending" })]);
      render(<TodoList />);

      expect(screen.getByTitle("Move to Currently working on")).toBeInTheDocument();
    });

    it("shows demote button for working tasks", () => {
      setTodos([makeTodo({ id: "1", text: "Working", status: "working" })]);
      render(<TodoList />);

      expect(screen.getByTitle("Move to Next tasks")).toBeInTheDocument();
    });

    it("no promote/demote for completed tasks", () => {
      setTodos([makeTodo({ id: "1", text: "Done", status: "completed" })]);
      render(<TodoList />);

      expect(screen.queryByTitle("Move to Currently working on")).not.toBeInTheDocument();
      expect(screen.queryByTitle("Move to Next tasks")).not.toBeInTheDocument();
    });
  });

  // --- 2.7 Drag-and-drop ---
  describe("2.7 drag-and-drop", () => {
    it("completed tasks are not draggable", () => {
      setTodos([makeTodo({ id: "c1", text: "Done", status: "completed" })]);
      render(<TodoList />);

      const row = screen.getByText("Done").closest("[draggable='true']");
      expect(row).toBeNull();
    });

    it("pending tasks are draggable", () => {
      setTodos([makeTodo({ id: "p1", text: "Drag me", status: "pending" })]);
      render(<TodoList />);

      const row = screen.getByText("Drag me").closest("[draggable='true']");
      expect(row).not.toBeNull();
    });

    it("working tasks are draggable", () => {
      setTodos([makeTodo({ id: "w1", text: "Drag me too", status: "working" })]);
      render(<TodoList />);

      const row = screen.getByText("Drag me too").closest("[draggable='true']");
      expect(row).not.toBeNull();
    });
  });
});
