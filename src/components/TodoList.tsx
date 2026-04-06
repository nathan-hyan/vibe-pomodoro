import { useTodos } from "../hooks/useTodos";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import type { Todo } from "../types";

export function TodoList() {
  const {
    workingTodos,
    pendingTodos,
    completedTodos,
    addTodo,
    deleteTodo,
    editTodo,
    completeTodo,
    uncompleteTodo,
    promoteToWorking,
    demoteFromWorking,
    reorderTodos,
  } = useTodos();

  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const hasAnyTodos = workingTodos.length > 0 || pendingTodos.length > 0 || completedTodos.length > 0;

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo(inputValue);
      setInputValue("");
    }
  };

  const handleAdd = () => {
    addTodo(inputValue);
    setInputValue("");
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editingId) {
      const trimmed = editText.trim();
      if (trimmed) {
        editTodo(editingId, trimmed);
      }
      setEditingId(null);
      setEditText("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  // Drag state per section
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragSection, setDragSection] = useState<"working" | "pending" | null>(null);

  const handleDragStart = (section: "working" | "pending", index: number) => {
    setDraggedIndex(index);
    setDragSection(section);
  };

  const handleDragOver = (e: React.DragEvent, section: "working" | "pending", index: number) => {
    e.preventDefault();
    if (draggedIndex === null || dragSection !== section || draggedIndex === index) return;

    const sectionTodos = section === "working" ? workingTodos : pendingTodos;
    reorderTodos(sectionTodos, draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragSection(null);
  };

  const renderTodoRow = (
    todo: Todo,
    index: number,
    section: "working" | "pending" | "completed"
  ) => {
    const isEditing = editingId === todo.id;
    const isDraggable = section !== "completed";
    const isCompleted = section === "completed";

    return (
      <div
        key={todo.id}
        draggable={isDraggable}
        onDragStart={isDraggable ? () => handleDragStart(section as "working" | "pending", index) : undefined}
        onDragOver={isDraggable ? (e) => handleDragOver(e, section as "working" | "pending", index) : undefined}
        onDragEnd={isDraggable ? handleDragEnd : undefined}
        className={clsx(
          "flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all group",
          isDraggable && "cursor-move",
          dragSection === section && draggedIndex === index && "opacity-50"
        )}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => isCompleted ? uncompleteTodo(todo.id) : completeTodo(todo.id)}
          className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-violet-500 checked:border-violet-500 cursor-pointer transition-all flex-shrink-0"
        />

        {/* Text / Edit input */}
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={saveEdit}
            className="flex-1 bg-white/10 text-white px-2 py-1 rounded border border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
          />
        ) : (
          <span
            onDoubleClick={() => !isCompleted && startEditing(todo)}
            className={clsx(
              "flex-1 transition-all",
              isCompleted ? "line-through text-white/40" : "text-white/90",
              !isCompleted && "cursor-text"
            )}
          >
            {todo.text}
          </span>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Promote / Demote */}
          {section === "pending" && (
            <button
              onClick={() => promoteToWorking(todo.id)}
              title="Move to Currently working on"
              className="text-white/40 hover:text-violet-400 transition-all cursor-pointer text-sm"
            >
              ▲
            </button>
          )}
          {section === "working" && (
            <button
              onClick={() => demoteFromWorking(todo.id)}
              title="Move to Next tasks"
              className="text-white/40 hover:text-violet-400 transition-all cursor-pointer text-sm"
            >
              ▼
            </button>
          )}

          {/* Delete */}
          <button
            onClick={() => deleteTodo(todo.id)}
            title="Delete task"
            className="text-white/40 hover:text-red-400 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    );
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
          onKeyDown={handleKeyDown}
          placeholder="What are you working on?"
          className="flex-1 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
        />
        <button
          onClick={handleAdd}
          className="bg-violet-500/80 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 sm:w-auto w-full cursor-pointer"
        >
          Add
        </button>
      </div>

      {/* Sections */}
      {hasAnyTodos ? (
        <div className="space-y-4 lg:flex-1 lg:overflow-y-auto lg:min-h-0">
          {/* Currently working on */}
          {workingTodos.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
                Currently working on
              </h3>
              <div className="space-y-2">
                {workingTodos.map((todo, index) => renderTodoRow(todo, index, "working"))}
              </div>
            </div>
          )}

          {/* Next tasks */}
          {pendingTodos.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                Next tasks
              </h3>
              <div className="space-y-2">
                {pendingTodos.map((todo, index) => renderTodoRow(todo, index, "pending"))}
              </div>
            </div>
          )}

          {/* Finished */}
          {completedTodos.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">
                Finished
              </h3>
              <div className="space-y-2">
                {completedTodos.map((todo, index) => renderTodoRow(todo, index, "completed"))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-white/40 text-center text-sm py-4">
          Add tasks to track your focus session
        </p>
      )}
    </div>
  );
}
