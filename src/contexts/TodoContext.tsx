import { useState } from "react";
import type { ReactNode } from "react";
import { useStats } from "../hooks/useStats";
import { TodoContext } from "./TodoContextDefinition";
import { playTaskCompleteChime } from "../utils/alarmSound";
import {
  useTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
  useReorderTodosMutation,
} from "../hooks/useQueryTodos";

export function TodoProvider({ children }: { children: ReactNode }) {
  /*
  TODO: Implement proper UUID generation instead of Date.now().toString()
  TODO: Implement proper text capitalization
  TODO: Zod validation for backend items and frontend forms
  */

  const [inputValue, setInputValue] = useState("");

  // React Query hooks
  const { data: todos = [], isLoading } = useTodosQuery();
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

  const addTodo = async () => {
    if (inputValue.trim()) {
      createTodoMutation.mutate(
        {
          text: inputValue.trim(),
          completed: false,
        },
        {
          onSuccess: () => {
            setInputValue("");
          },
        }
      );
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const newCompleted = !todo.completed;

    updateTodoMutation.mutate({
      id,
      updates: { completed: newCompleted },
    });

    // Handle stats and sound effects
    if (newCompleted && !todo.completed) {
      // Task is being checked (marked as completed)
      playTaskCompleteChime();
      incrementCompletedTasks();
      addSessionTask(todo.text);
    } else if (!newCompleted && todo.completed) {
      // Task is being unchecked (marked as incomplete)
      decrementCompletedTasks();
      removeSessionTask(todo.text);
    }
  };

  const deleteTodo = async (id: string) => {
    deleteTodoMutation.mutate(id);
  };

  const reorderTodosList = async (startIndex: number, endIndex: number) => {
    const result = Array.from(todos);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    reorderTodosMutation.mutate(result);
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        inputValue,
        isLoading,
        setInputValue,
        addTodo,
        toggleTodo,
        deleteTodo,
        reorderTodos: reorderTodosList,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}
