import type { Todo } from "../contexts/TodoContextDefinition";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Stats interface
export interface Stats {
  totalTimeWorked: number;
  completedSessions: number;
  completedTasks: number;
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// ============ TODO API ============

export async function getTodos(): Promise<Todo[]> {
  return fetchApi<Todo[]>("/todos");
}

export async function createTodo(todo: Omit<Todo, "id">): Promise<Todo> {
  return fetchApi<Todo>("/todos", {
    method: "POST",
    body: JSON.stringify(todo),
  });
}

export async function updateTodo(
  id: string,
  updates: Partial<Todo>
): Promise<Todo> {
  return fetchApi<Todo>(`/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function deleteTodo(id: string): Promise<void> {
  await fetchApi(`/todos/${id}`, {
    method: "DELETE",
  });
}

export async function reorderTodos(todos: Todo[]): Promise<void> {
  // Update all todos with their new positions
  // JSON Server doesn't have bulk update, so we'll do individual updates
  // For better performance, we could implement a custom route in JSON Server
  await Promise.all(
    todos.map((todo, index) =>
      fetchApi(`/todos/${todo.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...todo, order: index }),
      })
    )
  );
}

// ============ STATS API ============

export async function getStats(): Promise<Stats> {
  return fetchApi<Stats>("/stats");
}

export async function updateStats(updates: Partial<Stats>): Promise<Stats> {
  // JSON Server requires the ID for updates, but stats is a single object
  // We'll use PUT to replace the entire stats object
  const currentStats = await getStats();
  return fetchApi<Stats>("/stats", {
    method: "PUT",
    body: JSON.stringify({ ...currentStats, ...updates }),
  });
}

export async function resetStats(): Promise<Stats> {
  return fetchApi<Stats>("/stats", {
    method: "PUT",
    body: JSON.stringify({
      totalTimeWorked: 0,
      completedSessions: 0,
      completedTasks: 0,
    }),
  });
}

// ============ EXPORT/IMPORT ============

export async function exportData() {
  const [todos, stats] = await Promise.all([getTodos(), getStats()]);
  return {
    todos,
    stats,
    exportDate: new Date().toISOString(),
  };
}

export async function importData(data: {
  todos?: Todo[];
  stats?: Stats;
}): Promise<void> {
  // Delete all existing todos
  const existingTodos = await getTodos();
  await Promise.all(existingTodos.map((todo) => deleteTodo(todo.id)));

  // Import new todos
  if (data.todos) {
    await Promise.all(data.todos.map((todo) => createTodo(todo)));
  }

  // Import stats
  if (data.stats) {
    await updateStats(data.stats);
  }
}
