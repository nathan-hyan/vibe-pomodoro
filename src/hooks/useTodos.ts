import {
  useTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
  useReorderTodosMutation,
} from "./useQueryTodos";
import { useStats } from "./useStats";
import { playTaskCompleteChime } from "../utils/alarmSound";

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

  const addTodo = (text: string) => {
    if (text.trim()) {
      createTodoMutation.mutate({
        text: text.trim(),
        completed: false,
      });
    }
  };

  const toggleTodo = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const newCompleted = !todo.completed;

    updateTodoMutation.mutate({
      id,
      updates: { completed: newCompleted },
    });

    if (newCompleted && !todo.completed) {
      playTaskCompleteChime();
      incrementCompletedTasks();
      addSessionTask(todo.text);
    } else if (!newCompleted && todo.completed) {
      decrementCompletedTasks();
      removeSessionTask(todo.text);
    }
  };

  const deleteTodo = (id: string) => {
    deleteTodoMutation.mutate(id);
  };

  const reorderTodos = (startIndex: number, endIndex: number) => {
    const result = Array.from(todos);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    reorderTodosMutation.mutate(result);
  };

  return {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    reorderTodos,
  };
}
