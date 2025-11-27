import { useTodos } from "../hooks/useTodos";
import { useState } from "react";

export function TodoList() {
  const {
    todos,
    inputValue,
    setInputValue,
    addTodo,
    toggleTodo,
    deleteTodo,
    reorderTodos,
  } = useTodos();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    reorderTodos(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="lg:mb-0 mb-8 flex flex-col lg:h-full">
      <h2 className="text-xl lg:text-2xl font-semibold lg:font-bold text-white mb-4 lg:mb-6 text-center">
        Focus Tasks
      </h2>

      {/* Input */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="What are you working on?"
          className="flex-1 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
        />
        <button
          onClick={addTodo}
          className="bg-violet-500/80 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 sm:w-auto w-full cursor-pointer"
        >
          Add
        </button>
      </div>

      {/* Todo List */}
      {todos.length > 0 ? (
        <div className="space-y-2 lg:flex-1 lg:overflow-y-auto lg:min-h-0 overflow-y-visible max-h-48">
          {todos.map((todo, index) => (
            <div
              key={todo.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all group cursor-move ${
                draggedIndex === index ? "opacity-50" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-violet-500 checked:border-violet-500 cursor-pointer transition-all"
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
                className="text-white/40 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
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
