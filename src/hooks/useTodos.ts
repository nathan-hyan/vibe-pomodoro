import {
  useTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
  useReorderTodosMutation,
} from "./useQueryTodos";
import { useStats } from "./useStats";
import { playTaskCompleteChime } from "../utils/alarmSound";
import type { Todo } from "../types";

export function useTodos() {
  const { data: todos } = useTodosQuery(); // guaranteed non-undefined by useSuspenseQuery
  const createTodoMutation = useCreateTodoMutation();
  const updateTodoMutation = useUpdateTodoMutation();
  const deleteTodoMutation = useDeleteTodoMutation();
  const reorderTodosMutation = useReorderTodosMutation();

  const {
    incrementCompletedTasks,
    decrementCompletedTasks,
    addSessionTask,
    removeSessionTask,
  } = useStats();

  // Computed section arrays
  const workingTodos = todos
    .filter((t) => t.status === "working")
    .sort((a, b) => a.order - b.order);
  const pendingTodos = todos
    .filter((t) => t.status === "pending")
    .sort((a, b) => a.order - b.order);
  const completedTodos = todos
    .filter((t) => t.status === "completed")
    .sort((a, b) => a.order - b.order);

  const addTodo = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const maxOrder = todos.reduce((max, t) => Math.max(max, t.order), -1);
    createTodoMutation.mutate({
      text: trimmed,
      status: "pending",
      order: maxOrder + 1,
    });
  };

  const deleteTodo = (id: string) => {
    deleteTodoMutation.mutate(id);
  };

  const editTodo = (id: string, newText: string) => {
    const trimmed = newText.trim();
    if (!trimmed) return;

    updateTodoMutation.mutate({
      id,
      updates: { text: trimmed },
    });
  };

  const completeTodo = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo || todo.status === "completed") return;

    updateTodoMutation.mutate({
      id,
      updates: { status: "completed" },
    });

    try {
      playTaskCompleteChime();
    } catch {
      // Web Audio API may not be available in tests
    }
    incrementCompletedTasks();
    addSessionTask(todo.text);
  };

  const uncompleteTodo = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo || todo.status !== "completed") return;

    updateTodoMutation.mutate({
      id,
      updates: { status: "pending" },
    });

    decrementCompletedTasks();
    removeSessionTask(todo.text);
  };

  const promoteToWorking = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo || todo.status !== "pending") return;

    updateTodoMutation.mutate({
      id,
      updates: { status: "working" },
    });
  };

  const demoteFromWorking = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo || todo.status !== "working") return;

    updateTodoMutation.mutate({
      id,
      updates: { status: "pending" },
    });
  };

  const reorderTodos = (sectionTodos: Todo[], startIndex: number, endIndex: number) => {
    const result = Array.from(sectionTodos);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Reassign order values
    const reordered = result.map((todo, index) => ({ ...todo, order: index }));
    reorderTodosMutation.mutate(reordered);
  };

  return {
    todos,
    workingTodos,
    pendingTodos,
    completedTodos,
    addTodo,
    deleteTodo,
    editTodo,
    completeTodo,
    uncompleteTodo,
    promoteToWorking,
    demoteFromWorking,
    reorderTodos,
  };
}
