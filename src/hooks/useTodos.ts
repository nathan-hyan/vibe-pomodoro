import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { todosApi } from "../services/todos";
import handleApiResponse from "../utils/handleApiResponse";
import type { Todo } from "../types/todos";

export const useTodos = () => {
  return useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const response = await todosApi.getAllTodos({
        _sort: "index",
      });
      return handleApiResponse(response);
    },
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    retry: 3,
    gcTime: 5000,
    mutationFn: async (todoText: string) => {
      const todos = queryClient.getQueryData<Todo[]>(["todos"]) || [];
      const incompleteTodos = todos.filter(
        (t) => !t.completed && !t.id.startsWith("temp-")
      );

      await Promise.all(
        incompleteTodos.map((todo) =>
          todosApi.updateTodo(todo.id, { index: todo.index + 1 })
        )
      );

      const response = await todosApi.createTodo({
        text: todoText,
        completed: false,
        createdAt: new Date(),
        current: false,
        index: 0,
      } as Omit<Todo, "id">);
      return handleApiResponse(response);
    },
    onMutate: async (todoText: string) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      const optimisticTodo: Todo = {
        id: `temp-${Date.now()}`,
        text: todoText,
        completed: false,
        createdAt: new Date(),
        index: 0,
      };

      queryClient.setQueryData<Todo[]>(["todos"], (old = []) => {
        const incompleteTodos = old.filter((t) => !t.completed);
        const completedTodos = old.filter((t) => t.completed);

        const updatedIncompleteTodos = incompleteTodos.map((todo) => ({
          ...todo,
          index: todo.index + 1,
        }));

        return [optimisticTodo, ...updatedIncompleteTodos, ...completedTodos];
      });

      return { previousTodos };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useToggleTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const todos = queryClient.getQueryData<Todo[]>(["todos"]);
      const todo = todos?.find((t) => t.id === id);

      if (!todo) throw new Error("Todo not found");

      const newCompleted = !todo.completed;
      let newIndex = todo.index;

      if (newCompleted) {
        newIndex = 10000 + Date.now();
      } else {
        const incompleteTodos = todos?.filter((t) => !t.completed) || [];
        newIndex = incompleteTodos.length;
      }

      const response = await todosApi.updateTodo(id, {
        completed: newCompleted,
        index: newIndex,
      });

      return handleApiResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await todosApi.deleteTodo(id);

      return handleApiResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

export const useReorderTodos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reorderedTodos: Todo[]) => {
      const incompleteTodos = reorderedTodos.filter((t) => !t.completed);

      await Promise.all(
        incompleteTodos.map((todo, index) =>
          todosApi.updateTodo(todo.id, { index })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};
