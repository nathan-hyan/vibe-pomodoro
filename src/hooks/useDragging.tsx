import { useState } from "react";
import { useReorderTodos } from "./useTodos";
import type { Todo } from "../types/todos";

function useDragging(todos: Todo[]) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localTodos, setLocalTodos] = useState<Todo[]>([]);
  const { mutateAsync: reorderTodos } = useReorderTodos();

  const incompleteTodos = todos.filter(
    (t) => !t.completed && !t.id.startsWith("temp-")
  );

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    setLocalTodos(incompleteTodos);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setLocalTodos((prev) => {
      const reordered = [...prev];
      const [moved] = reordered.splice(draggedIndex, 1);
      reordered.splice(index, 0, moved);
      return reordered;
    });

    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null || localTodos.length === 0) return;

    try {
      await reorderTodos(localTodos);
    } catch (error) {
      console.error("Failed to reorder todos:", error);
    } finally {
      setDraggedIndex(null);
      setLocalTodos([]);
    }
  };

  return { handleDragStart, handleDragOver, handleDragEnd, draggedIndex };
}
export default useDragging;
