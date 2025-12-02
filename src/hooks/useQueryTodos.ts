import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../services/api";
import type { Todo } from "../contexts/TodoContextDefinition";

// Query keys
export const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filters?: string) => [...todoKeys.lists(), { filters }] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
};

// ============ QUERIES ============

export function useTodosQuery() {
  return useQuery({
    queryKey: todoKeys.lists(),
    queryFn: api.getTodos,
  });
}

// ============ MUTATIONS ============

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createTodo,
    onMutate: async (newTodo) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.lists());

      // Optimistically update to the new value
      queryClient.setQueryData<Todo[]>(todoKeys.lists(), (old = []) => [
        ...old,
        { ...newTodo, id: `temp-${Date.now()}` } as Todo,
      ]);

      return { previousTodos };
    },
    onError: (_err, _newTodo, context) => {
      // Rollback to previous value on error
      if (context?.previousTodos) {
        queryClient.setQueryData(todoKeys.lists(), context.previousTodos);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Todo> }) =>
      api.updateTodo(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() });

      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.lists());

      queryClient.setQueryData<Todo[]>(todoKeys.lists(), (old = []) =>
        old.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo))
      );

      return { previousTodos };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(todoKeys.lists(), context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteTodo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() });

      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.lists());

      queryClient.setQueryData<Todo[]>(todoKeys.lists(), (old = []) =>
        old.filter((todo) => todo.id !== id)
      );

      return { previousTodos };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(todoKeys.lists(), context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}

export function useReorderTodosMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.reorderTodos,
    onMutate: async (newTodos) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() });

      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.lists());

      queryClient.setQueryData<Todo[]>(todoKeys.lists(), newTodos);

      return { previousTodos };
    },
    onError: (_err, _newTodos, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(todoKeys.lists(), context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}
