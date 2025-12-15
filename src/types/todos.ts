export interface Todo {
  id: string;
  index: number;
  text: string;
  completed: boolean;
  createdAt: Date;
  current: boolean;
}

export interface TodoContextType {
  todos: Todo[];
  inputValue: string;
  isLoading: boolean;
  setInputValue: (value: string) => void;
  addTodo: () => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (startIndex: number, endIndex: number) => void;
}
