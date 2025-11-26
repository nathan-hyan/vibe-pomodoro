import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoContextType {
  todos: Todo[];
  inputValue: string;
  setInputValue: (value: string) => void;
  addTodo: () => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (startIndex: number, endIndex: number) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

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
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
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

export function useTodos() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error("useTodos must be used within a TodoProvider");
  }
  return context;
}
