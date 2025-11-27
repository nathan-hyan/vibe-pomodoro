import { useState } from "react";
import type { ReactNode } from "react";
import { useStats } from "../hooks/useStats";
import { TodoContext, type Todo } from "./TodoContextDefinition";
import { playTaskCompleteChime } from "../utils/alarmSound";

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const { incrementCompletedTasks, addSessionTask } = useStats();

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
          // Track when task is marked as completed
          if (newCompleted && !todo.completed) {
            playTaskCompleteChime(); // Play chime sound
            incrementCompletedTasks();
            addSessionTask(todo.text);
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
