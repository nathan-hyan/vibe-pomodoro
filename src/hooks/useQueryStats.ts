import { useMutation, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../services/api";
import type { Stats, StatEntry } from "../services/api";

// Query keys
export const statsKeys = {
  all: ["stats"] as const,
  detail: () => [...statsKeys.all, "detail"] as const,
};

export const statEntriesKeys = {
  all: ["statEntries"] as const,
  list: () => [...statEntriesKeys.all, "list"] as const,
};

// ============ QUERIES ============

export function useStatsQuery() {
  return useSuspenseQuery({
    queryKey: statsKeys.detail(),
    queryFn: api.getStats,
  });
}

// ============ MUTATIONS ============

export function useUpdateStatsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateStats,
    onMutate: async (newStats) => {
      await queryClient.cancelQueries({ queryKey: statsKeys.detail() });

      const previousStats = queryClient.getQueryData<Stats>(statsKeys.detail());

      queryClient.setQueryData<Stats>(statsKeys.detail(), (old) => ({
        ...old!,
        ...newStats,
      }));

      return { previousStats };
    },
    onError: (_err, _newStats, context) => {
      if (context?.previousStats) {
        queryClient.setQueryData(statsKeys.detail(), context.previousStats);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: statsKeys.detail(), refetchType: "none" });
    },
  });
}

export function useResetStatsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.resetStats,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: statsKeys.detail() });

      const previousStats = queryClient.getQueryData<Stats>(statsKeys.detail());

      queryClient.setQueryData<Stats>(statsKeys.detail(), {
        totalTimeWorked: 0,
        completedSessions: 0,
        completedTasks: 0,
      });

      return { previousStats };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousStats) {
        queryClient.setQueryData(statsKeys.detail(), context.previousStats);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: statsKeys.detail(), refetchType: "none" });
    },
  });
}

// Helper hook for incrementing completed tasks
export function useIncrementCompletedTasksMutation() {
  const queryClient = useQueryClient();
  const updateStats = useUpdateStatsMutation();

  return useMutation({
    mutationFn: async () => {
      const currentStats = queryClient.getQueryData<Stats>(statsKeys.detail());
      if (!currentStats) throw new Error("Stats not loaded");

      return updateStats.mutateAsync({
        ...currentStats,
        completedTasks: currentStats.completedTasks + 1,
      });
    },
  });
}

// Helper hook for decrementing completed tasks
export function useDecrementCompletedTasksMutation() {
  const queryClient = useQueryClient();
  const updateStats = useUpdateStatsMutation();

  return useMutation({
    mutationFn: async () => {
      const currentStats = queryClient.getQueryData<Stats>(statsKeys.detail());
      if (!currentStats) throw new Error("Stats not loaded");

      return updateStats.mutateAsync({
        ...currentStats,
        completedTasks: Math.max(0, currentStats.completedTasks - 1),
      });
    },
  });
}

// Helper hook for adding completed session
export function useAddCompletedSessionMutation() {
  const queryClient = useQueryClient();
  const updateStats = useUpdateStatsMutation();

  return useMutation({
    mutationFn: async (duration: number) => {
      const currentStats = queryClient.getQueryData<Stats>(statsKeys.detail());
      if (!currentStats) throw new Error("Stats not loaded");

      return updateStats.mutateAsync({
        ...currentStats,
        totalTimeWorked: currentStats.totalTimeWorked + duration,
        completedSessions: currentStats.completedSessions + 1,
      });
    },
  });
}

// ============ STAT ENTRIES ============

export function useStatEntriesQuery() {
  return useSuspenseQuery({
    queryKey: statEntriesKeys.list(),
    queryFn: api.getStatEntries,
  });
}

export function useCreateStatEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createStatEntry,
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: statEntriesKeys.list() });

      const previousEntries = queryClient.getQueryData<StatEntry[]>(statEntriesKeys.list());

      queryClient.setQueryData<StatEntry[]>(statEntriesKeys.list(), (old = []) => [
        ...old,
        { ...newEntry, id: `temp-${Date.now()}` },
      ]);

      return { previousEntries };
    },
    onError: (_err, _newEntry, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(statEntriesKeys.list(), context.previousEntries);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: statEntriesKeys.list(), refetchType: "none" });
    },
  });
}

export function useDeleteAllStatEntriesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteAllStatEntries,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: statEntriesKeys.list() });

      const previousEntries = queryClient.getQueryData<StatEntry[]>(statEntriesKeys.list());

      queryClient.setQueryData<StatEntry[]>(statEntriesKeys.list(), []);

      return { previousEntries };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(statEntriesKeys.list(), context.previousEntries);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: statEntriesKeys.list(), refetchType: "none" });
    },
  });
}
