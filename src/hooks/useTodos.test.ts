import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTodos,
  useCreateTodo,
  useToggleTodo,
  useDeleteTodo,
  useReorderTodos,
} from './useTodos';
import { todosApi } from '../services/todos';
import type { Todo } from '../types/todos';

vi.mock('../services/todos');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useTodos', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      text: 'Test todo 1',
      completed: false,
      index: 0,
      current: false,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      text: 'Test todo 2',
      completed: true,
      index: 1,
      current: false,
      createdAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useTodos query', () => {
    it('should fetch todos successfully', async () => {
      vi.mocked(todosApi.getAllTodos).mockResolvedValue({
        ok: true,
        data: mockTodos,
      } as any);

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTodos);
      expect(todosApi.getAllTodos).toHaveBeenCalledWith({ _sort: 'index' });
    });

    it('should handle empty todos list', async () => {
      vi.mocked(todosApi.getAllTodos).mockResolvedValue({
        ok: true,
        data: [],
      } as any);

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });

    it('should handle fetch error', async () => {
      vi.mocked(todosApi.getAllTodos).mockResolvedValue({
        ok: false,
        problem: 'NETWORK_ERROR',
      } as any);

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useCreateTodo mutation', () => {
    it('should create a new todo', async () => {
      const newTodo: Todo = {
        id: '3',
        text: 'New todo',
        completed: false,
        index: 0,
        current: false,
        createdAt: new Date(),
      };

      vi.mocked(todosApi.getAllTodos).mockResolvedValue({
        ok: true,
        data: mockTodos,
      } as any);

      vi.mocked(todosApi.createTodo).mockResolvedValue({
        ok: true,
        data: newTodo,
      } as any);

      vi.mocked(todosApi.updateTodo).mockResolvedValue({
        ok: true,
        data: {} as Todo,
      } as any);

      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('New todo');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(todosApi.createTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'New todo',
          completed: false,
          index: 0,
        })
      );
    });

    it('should handle optimistic updates', async () => {
      vi.mocked(todosApi.getAllTodos).mockResolvedValue({
        ok: true,
        data: [],
      } as any);

      vi.mocked(todosApi.createTodo).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                data: {
                  id: '1',
                  text: 'Test',
                  completed: false,
                  index: 0,
                  current: false,
                  createdAt: new Date(),
                },
              } as any);
            }, 100);
          })
      );

      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('Test');

      // The mutation should be in loading state
      expect(result.current.isPending).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true), {
        timeout: 3000,
      });
    });

    it('should increment indices of existing incomplete todos', async () => {
      const existingTodos: Todo[] = [
        {
          id: '1',
          text: 'Todo 1',
          completed: false,
          index: 0,
          current: false,
          createdAt: new Date(),
        },
        {
          id: '2',
          text: 'Todo 2',
          completed: false,
          index: 1,
          current: false,
          createdAt: new Date(),
        },
      ];

      vi.mocked(todosApi.getAllTodos).mockResolvedValue({
        ok: true,
        data: existingTodos,
      } as any);

      vi.mocked(todosApi.updateTodo).mockResolvedValue({
        ok: true,
        data: {} as Todo,
      } as any);

      vi.mocked(todosApi.createTodo).mockResolvedValue({
        ok: true,
        data: {
          id: '3',
          text: 'New todo',
          completed: false,
          index: 0,
          current: false,
          createdAt: new Date(),
        },
      } as any);

      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('New todo');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Verify updateTodo was called for each incomplete todo
      expect(todosApi.updateTodo).toHaveBeenCalledTimes(2);
      expect(todosApi.updateTodo).toHaveBeenCalledWith('1', { index: 1 });
      expect(todosApi.updateTodo).toHaveBeenCalledWith('2', { index: 2 });
    });

    it('should handle creation error and rollback optimistic update', async () => {
      vi.mocked(todosApi.getAllTodos).mockResolvedValue({
        ok: true,
        data: [],
      } as any);

      vi.mocked(todosApi.createTodo).mockResolvedValue({
        ok: false,
        problem: 'SERVER_ERROR',
      } as any);

      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('Failed todo')).rejects.toThrow();

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useToggleTodo mutation', () => {
    it('should toggle todo from incomplete to complete', async () => {
      const todo = mockTodos[0];

      vi.mocked(todosApi.getAllTodos).mockResolvedValue({
        ok: true,
        data: mockTodos,
      } as any);

      vi.mocked(todosApi.updateTodo).mockResolvedValue({
        ok: true,
        data: { ...todo, completed: true },
      } as any);

      const { result } = renderHook(() => useToggleTodo(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(todosApi.updateTodo).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          completed: true,
          index: expect.any(Number),
        })
      );
    });

    it('should toggle todo from complete to incomplete', async () => {
      const completedTodo = mockTodos[1];

      vi.mocked(todosApi.getAllTodos).mockResolvedValue({
        ok: true,
        data: mockTodos,
      } as any);

      vi.mocked(todosApi.updateTodo).mockResolvedValue({
        ok: true,
        data: { ...completedTodo, completed: false },
      } as any);

      const { result } = renderHook(() => useToggleTodo(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('2');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(todosApi.updateTodo).toHaveBeenCalledWith(
        '2',
        expect.objectContaining({
          completed: false,
        })
      );
    });

    it('should throw error when todo not found', async () => {
      vi.mocked(todosApi.getAllTodos).mockResolvedValue({
        ok: true,
        data: mockTodos,
      } as any);

      const { result } = renderHook(() => useToggleTodo(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('nonexistent')).rejects.toThrow(
        'Todo not found'
      );
    });

    it('should assign high index when completing todo', async () => {
      const incompleteTodo = mockTodos[0];

      vi.mocked(todosApi.getAllTodos).mockResolvedValue({
        ok: true,
        data: mockTodos,
      } as any);

      vi.mocked(todosApi.updateTodo).mockResolvedValue({
        ok: true,
        data: { ...incompleteTodo, completed: true },
      } as any);

      const { result } = renderHook(() => useToggleTodo(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const callArgs = vi.mocked(todosApi.updateTodo).mock.calls[0][1];
      expect(callArgs.index).toBeGreaterThan(10000);
    });
  });

  describe('useDeleteTodo mutation', () => {
    it('should delete a todo', async () => {
      vi.mocked(todosApi.deleteTodo).mockResolvedValue({
        ok: true,
        data: undefined,
      } as any);

      const { result } = renderHook(() => useDeleteTodo(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(todosApi.deleteTodo).toHaveBeenCalledWith('1');
    });

    it('should handle delete error', async () => {
      vi.mocked(todosApi.deleteTodo).mockResolvedValue({
        ok: false,
        problem: 'NOT_FOUND',
      } as any);

      const { result } = renderHook(() => useDeleteTodo(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('999')).rejects.toThrow();

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useReorderTodos mutation', () => {
    it('should reorder incomplete todos', async () => {
      const reorderedTodos: Todo[] = [
        {
          id: '2',
          text: 'Todo 2',
          completed: false,
          index: 0,
          current: false,
          createdAt: new Date(),
        },
        {
          id: '1',
          text: 'Todo 1',
          completed: false,
          index: 1,
          current: false,
          createdAt: new Date(),
        },
      ];

      vi.mocked(todosApi.updateTodo).mockResolvedValue({
        ok: true,
        data: {} as Todo,
      } as any);

      const { result } = renderHook(() => useReorderTodos(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(reorderedTodos);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(todosApi.updateTodo).toHaveBeenCalledTimes(2);
      expect(todosApi.updateTodo).toHaveBeenCalledWith('2', { index: 0 });
      expect(todosApi.updateTodo).toHaveBeenCalledWith('1', { index: 1 });
    });

    it('should only update incomplete todos', async () => {
      const todosWithCompleted: Todo[] = [
        {
          id: '1',
          text: 'Todo 1',
          completed: false,
          index: 0,
          current: false,
          createdAt: new Date(),
        },
        {
          id: '2',
          text: 'Todo 2',
          completed: true,
          index: 1,
          current: false,
          createdAt: new Date(),
        },
      ];

      vi.mocked(todosApi.updateTodo).mockResolvedValue({
        ok: true,
        data: {} as Todo,
      } as any);

      const { result } = renderHook(() => useReorderTodos(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(todosWithCompleted);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Should only update the incomplete todo
      expect(todosApi.updateTodo).toHaveBeenCalledTimes(1);
      expect(todosApi.updateTodo).toHaveBeenCalledWith('1', { index: 0 });
    });

    it('should handle empty array', async () => {
      vi.mocked(todosApi.updateTodo).mockResolvedValue({
        ok: true,
        data: {} as Todo,
      } as any);

      const { result } = renderHook(() => useReorderTodos(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync([]);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(todosApi.updateTodo).not.toHaveBeenCalled();
    });
  });
});