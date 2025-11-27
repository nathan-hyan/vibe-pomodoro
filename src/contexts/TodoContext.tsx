import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useStats } from "../hooks/useStats";
import { TodoContext, type Todo } from "./TodoContextDefinition";
import { playTaskCompleteChime } from "../utils/alarmSound";

const TODOS_STORAGE_KEY = "vibePomodoro_todos";

export function TodoProvider({ children }: { children: ReactNode }) {
  // Load todos from localStorage on mount
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const stored = localStorage.getItem(TODOS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [inputValue, setInputValue] = useState("");
  const {
    incrementCompletedTasks,
    decrementCompletedTasks,
    addSessionTask,
    removeSessionTask,
  } = useStats();

  // Save todos to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error("Failed to save todos to localStorage:", error);
    }
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: inputValue.trim(),
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setInputValue("");
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          const newCompleted = !todo.completed;

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

          return { ...todo, completed: newCompleted };
        }
        return todo;
      })
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const reorderTodos = (startIndex: number, endIndex: number) => {
    const result = Array.from(todos);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setTodos(result);
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        inputValue,
        setInputValue,
        addTodo,
        toggleTodo,
        deleteTodo,
        reorderTodos,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}
