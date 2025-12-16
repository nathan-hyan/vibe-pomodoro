/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useDragging from "./useDragging";
import type { Todo } from "../types/todos";
import * as useTodosModule from "./useTodos";

vi.mock("./useTodos", async () => {
  const actual = await vi.importActual("./useTodos");
  return {
    ...actual,
    useReorderTodos: vi.fn(),
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useDragging", () => {
  const mockTodos: Todo[] = [
    {
      id: "1",
      text: "Todo 1",
      completed: false,
      index: 0,
      current: false,
      createdAt: new Date(),
    },
    {
      id: "2",
      text: "Todo 2",
      completed: false,
      index: 1,
      current: false,
      createdAt: new Date(),
    },
    {
      id: "3",
      text: "Todo 3",
      completed: false,
      index: 2,
      current: false,
      createdAt: new Date(),
    },
    {
      id: "4",
      text: "Completed Todo",
      completed: true,
      index: 3,
      current: false,
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with null draggedIndex", () => {
    const mockMutateAsync = vi.fn();
    vi.mocked(useTodosModule.useReorderTodos).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    const { result } = renderHook(() => useDragging(mockTodos), {
      wrapper: createWrapper(),
    });

    expect(result.current.draggedIndex).toBeNull();
  });

  it("should set draggedIndex when handleDragStart is called", () => {
    const mockMutateAsync = vi.fn();
    vi.mocked(useTodosModule.useReorderTodos).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    const { result } = renderHook(() => useDragging(mockTodos), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleDragStart(1);
    });

    expect(result.current.draggedIndex).toBe(1);
  });

  it("should update draggedIndex when handleDragOver is called", () => {
    const mockMutateAsync = vi.fn();
    vi.mocked(useTodosModule.useReorderTodos).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    const { result } = renderHook(() => useDragging(mockTodos), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleDragStart(0);
    });

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragOver(mockEvent, 2);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.draggedIndex).toBe(2);
  });

  it("should not update when dragging over same index", () => {
    const mockMutateAsync = vi.fn();
    vi.mocked(useTodosModule.useReorderTodos).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    const { result } = renderHook(() => useDragging(mockTodos), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleDragStart(1);
    });

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragOver(mockEvent, 1);
    });

    expect(result.current.draggedIndex).toBe(1);
  });

  it("should not update when draggedIndex is null", () => {
    const mockMutateAsync = vi.fn();
    vi.mocked(useTodosModule.useReorderTodos).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    const { result } = renderHook(() => useDragging(mockTodos), {
      wrapper: createWrapper(),
    });

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragOver(mockEvent, 1);
    });

    expect(result.current.draggedIndex).toBeNull();
  });

  it("should call reorderTodos mutation on handleDragEnd", async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useTodosModule.useReorderTodos).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    const { result } = renderHook(() => useDragging(mockTodos), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleDragStart(0);
    });

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.DragEvent;

    act(() => {
      result.current.handleDragOver(mockEvent, 2);
    });

    await act(async () => {
      await result.current.handleDragEnd();
    });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });

    expect(result.current.draggedIndex).toBeNull();
  });

  it("should reset state after drag ends", async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useTodosModule.useReorderTodos).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    const { result } = renderHook(() => useDragging(mockTodos), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleDragStart(0);
    });

    await act(async () => {
      await result.current.handleDragEnd();
    });

    expect(result.current.draggedIndex).toBeNull();
  });

  it("should handle drag end with null draggedIndex gracefully", async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useTodosModule.useReorderTodos).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    const { result } = renderHook(() => useDragging(mockTodos), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.handleDragEnd();
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("should filter out completed and temporary todos", () => {
    const todosWithTempAndCompleted: Todo[] = [
      ...mockTodos,
      {
        id: "temp-123",
        text: "Temp todo",
        completed: false,
        index: 4,
        current: false,
        createdAt: new Date(),
      },
    ];

    const mockMutateAsync = vi.fn();
    vi.mocked(useTodosModule.useReorderTodos).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    const { result } = renderHook(
      () => useDragging(todosWithTempAndCompleted),
      {
        wrapper: createWrapper(),
      }
    );

    act(() => {
      result.current.handleDragStart(0);
    });

    expect(result.current.draggedIndex).toBe(0);
  });

  it("should handle reorder error gracefully", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockMutateAsync = vi
      .fn()
      .mockRejectedValue(new Error("Reorder failed"));
    vi.mocked(useTodosModule.useReorderTodos).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    const { result } = renderHook(() => useDragging(mockTodos), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleDragStart(0);
    });

    await act(async () => {
      await result.current.handleDragEnd();
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to reorder todos:",
        expect.any(Error)
      );
    });

    expect(result.current.draggedIndex).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  it("should handle drag sequence correctly", async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useTodosModule.useReorderTodos).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    const { result } = renderHook(() => useDragging(mockTodos), {
      wrapper: createWrapper(),
    });

    // Start dragging from index 0
    act(() => {
      result.current.handleDragStart(0);
    });
    expect(result.current.draggedIndex).toBe(0);

    // Drag over index 1
    const mockEvent1 = {
      preventDefault: vi.fn(),
    } as unknown as React.DragEvent;
    act(() => {
      result.current.handleDragOver(mockEvent1, 1);
    });
    expect(result.current.draggedIndex).toBe(1);

    // Drag over index 2
    const mockEvent2 = {
      preventDefault: vi.fn(),
    } as unknown as React.DragEvent;
    act(() => {
      result.current.handleDragOver(mockEvent2, 2);
    });
    expect(result.current.draggedIndex).toBe(2);

    // End dragging
    await act(async () => {
      await result.current.handleDragEnd();
    });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });

    expect(result.current.draggedIndex).toBeNull();
  });

  it("should work with empty todos array", () => {
    const mockMutateAsync = vi.fn();
    vi.mocked(useTodosModule.useReorderTodos).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    const { result } = renderHook(() => useDragging([]), {
      wrapper: createWrapper(),
    });

    expect(result.current.draggedIndex).toBeNull();
  });

  it("should work with single todo", () => {
    const singleTodo: Todo[] = [mockTodos[0]];

    const mockMutateAsync = vi.fn();
    vi.mocked(useTodosModule.useReorderTodos).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);

    const { result } = renderHook(() => useDragging(singleTodo), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleDragStart(0);
    });

    expect(result.current.draggedIndex).toBe(0);
  });
});
