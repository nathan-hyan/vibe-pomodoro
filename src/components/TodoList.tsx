import { useState } from "react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export function TodoList() {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
      <h2 className="text-xl font-semibold text-white mb-4 text-center">
        Focus Tasks
      </h2>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="What are you working on?"
          className="flex-1 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
        />
        <button
          onClick={addTodo}
          className="bg-emerald-500/80 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
        >
          Add
        </button>
      </div>

      {/* Todo List */}
      {todos.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-emerald-500 checked:border-emerald-500 cursor-pointer transition-all"
              />
              <span
                className={`flex-1 text-white transition-all ${
                  todo.completed
                    ? "line-through text-white/50"
                    : "text-white/90"
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-white/40 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/40 text-center text-sm py-4">
          Add tasks to track your focus session
        </p>
      )}
    </div>
  );
}
