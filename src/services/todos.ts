import { create } from "apisauce";
import API_URL from "../utils/getApiUrl";
import type { Todo } from "../types/todos";

const api = create({
  baseURL: `${API_URL}/todos`,
});

export type GetTodosParams = {
  _sort?: "index";
};

export const todosApi = {
  getAllTodos: async (params: GetTodosParams = {}) =>
    await api.get<Todo[]>("", params),
  getSingleTodo: async (id: string) => await api.get<Todo>(`/${id}`),
  createTodo: async (todo: Omit<Todo, "id">) => await api.post<Todo>("", todo),
  updateTodo: async (id: string, updates: Partial<Todo>) =>
    await api.patch<Todo>(`/${id}`, updates),
  replaceTodo: async (id: string, todo: Todo) =>
    await api.put<Todo>(`/${id}`, todo),
  deleteTodo: async (id: string) => await api.delete<void>(`/${id}`),
};

export default api;
