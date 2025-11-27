import { createContext } from "react";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoContextType {
  todos: Todo[];
  inputValue: string;
  setInputValue: (value: string) => void;
  addTodo: () => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (startIndex: number, endIndex: number) => void;
}

export const TodoContext = createContext<TodoContextType | undefined>(
  undefined
);
