import type { Todo, Stats, StatEntry } from "../types";
export type { Stats, StatEntry };
import API_URL from "../utils/getApiUrl";

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
  const todos = await fetchApi<Todo[]>("/todos");
  return todos.sort((a, b) => a.order - b.order);
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

// ============ STAT ENTRIES API ============

export async function getStatEntries(): Promise<StatEntry[]> {
  return fetchApi<StatEntry[]>("/statEntries");
}

export async function createStatEntry(
  entry: Omit<StatEntry, "id">
): Promise<StatEntry> {
  return fetchApi<StatEntry>("/statEntries", {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

export async function deleteAllStatEntries(): Promise<void> {
  const entries = await getStatEntries();
  await Promise.all(
    entries.map((entry) =>
      fetchApi(`/statEntries/${entry.id}`, { method: "DELETE" })
    )
  );
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
