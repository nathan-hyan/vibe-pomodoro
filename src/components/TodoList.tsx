import classNames from "classnames";
import { useState } from "react";
import useDragging from "../hooks/useDragging";
import {
  useCreateTodo,
  useDeleteTodo,
  useTodos,
  useToggleTodo,
} from "../hooks/useTodos";

export function TodoList() {
  const [inputValue, setInputValue] = useState("");

  const { data: todos, isLoading } = useTodos();
  const { mutateAsync: createTodo } = useCreateTodo();
  const { mutateAsync: toggleTodo } = useToggleTodo();
  const { mutateAsync: deleteTodo } = useDeleteTodo();

  const { handleDragEnd, handleDragOver, handleDragStart, draggedIndex } =
    useDragging(todos || []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();

    if (!text) return;

    await createTodo(text);
    setInputValue("");
  };

  // const {
  //   todos,
  //   addTodo,
  //   toggleTodo,
  //   deleteTodo,
  //   handleDragEnd,
  //   handleDragOver,
  //   handleDragStart,
  //   draggedIndex,
  //   inputValue,
  //   setInputValue,
  // } = useMockedTodoData();

  if (isLoading || !todos) return <div>Loading...</div>;

  return (
    <div className="lg:mb-0 mb-8 flex flex-col lg:h-full">
      <h2 className="text-xl lg:text-2xl font-semibold lg:font-bold text-white mb-4 lg:mb-6 text-center">
        Focus Tasks
      </h2>

      {/* Input */}
      <form onSubmit={addTodo} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What are you working on?"
          className="flex-1 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
        />
        <button
          type="submit"
          className="bg-violet-500/80 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 sm:w-auto w-full cursor-pointer"
        >
          Add
        </button>
      </form>

      {/* Todo List */}
      {todos.length > 0 ? (
        <div className="space-y-2 lg:flex-1 lg:overflow-y-auto lg:min-h-0 overflow-y-visible max-h-48">
          {todos.map((todo) => {
            const isOptimistic = todo.id.startsWith("temp-");
            const isDraggable = !todo.completed && !isOptimistic;

            const incompleteTodos = todos.filter(
              (t) => !t.completed && !t.id.startsWith("temp-")
            );
            const dragIndex = incompleteTodos.findIndex(
              (t) => t.id === todo.id
            );

            return (
              <div
                key={todo.id}
                draggable={isDraggable}
                onDragStart={
                  isDraggable ? () => handleDragStart(dragIndex) : undefined
                }
                onDragOver={
                  isDraggable ? (e) => handleDragOver(e, dragIndex) : undefined
                }
                onDragEnd={isDraggable ? handleDragEnd : undefined}
                className={classNames(
                  "flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all group",
                  {
                    "opacity-50":
                      isOptimistic ||
                      (draggedIndex === dragIndex && isDraggable),
                    "cursor-move": isDraggable,
                    "cursor-default": !isDraggable,
                  }
                )}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-violet-500 checked:border-violet-500 cursor-pointer transition-all"
                />
                <span
                  className={classNames("flex-1 text-white transition-all", {
                    "animate-pulse": isOptimistic,
                    "line-through text-white/50": todo.completed,
                    "text-white/90": !todo.completed,
                  })}
                >
                  {todo.text}
                </span>
                {isOptimistic ? (
                  <p className="text-white/80 animate-pulse">(uploading...)</p>
                ) : (
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-white/40 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-white/40 text-center text-sm py-4">
          Add tasks to track your focus session
        </p>
      )}
    </div>
  );
}
