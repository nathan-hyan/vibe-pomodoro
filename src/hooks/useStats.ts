import {
  useStatsQuery,
  useAddCompletedSessionMutation,
  useIncrementCompletedTasksMutation,
  useDecrementCompletedTasksMutation,
  useResetStatsMutation,
  useStatEntriesQuery,
  useCreateStatEntryMutation,
  useDeleteAllStatEntriesMutation,
} from "./useQueryStats";
import {
  useSessionTasks,
  addSessionTask,
  removeSessionTask,
  clearSessionTasks,
} from "../stores/sessionTasksStore";
import { isToday, isThisWeek, isThisMonth } from "../utils/dateFilters";
import type { StatEntry } from "../types";

export interface PeriodStats {
  timeWorked: number;
  sessions: number;
  tasks: number;
}

function computePeriodStats(
  entries: StatEntry[],
  filterFn: (timestamp: string) => boolean
): PeriodStats {
  const filtered = entries.filter((e) => filterFn(e.timestamp));

  const timeWorked = filtered
    .filter((e) => e.type === "session")
    .reduce((sum, e) => sum + e.value, 0);

  const sessions = filtered.filter((e) => e.type === "session").length;

  const tasks = filtered
    .filter((e) => e.type === "task")
    .reduce((sum, e) => sum + e.value, 0);

  return { timeWorked, sessions, tasks: Math.max(0, tasks) };
}

export function useStats() {
  const { data: stats } = useStatsQuery(); // guaranteed non-undefined by useSuspenseQuery
  const { data: statEntries } = useStatEntriesQuery();
  const addSessionMutation = useAddCompletedSessionMutation();
  const incrementTasksMutation = useIncrementCompletedTasksMutation();
  const decrementTasksMutation = useDecrementCompletedTasksMutation();
  const resetStatsMutation = useResetStatsMutation();
  const createStatEntryMutation = useCreateStatEntryMutation();
  const deleteAllStatEntriesMutation = useDeleteAllStatEntriesMutation();
  const sessionCompletedTasks = useSessionTasks();

  const dayStats = computePeriodStats(statEntries, isToday);
  const weekStats = computePeriodStats(statEntries, isThisWeek);
  const monthStats = computePeriodStats(statEntries, isThisMonth);

  const addCompletedSession = (duration: number) => {
    addSessionMutation.mutate(duration);
    createStatEntryMutation.mutate({
      type: "session",
      value: duration,
      timestamp: new Date().toISOString(),
    });
  };

  const incrementCompletedTasks = () => {
    incrementTasksMutation.mutate();
    createStatEntryMutation.mutate({
      type: "task",
      value: 1,
      timestamp: new Date().toISOString(),
    });
  };

  const decrementCompletedTasks = () => {
    decrementTasksMutation.mutate();
    createStatEntryMutation.mutate({
      type: "task",
      value: -1,
      timestamp: new Date().toISOString(),
    });
  };

  const resetStats = () => {
    resetStatsMutation.mutate();
    deleteAllStatEntriesMutation.mutate();
    clearSessionTasks();
  };

  return {
    stats,
    statEntries,
    dayStats,
    weekStats,
    monthStats,
    sessionCompletedTasks,
    addCompletedSession,
    incrementCompletedTasks,
    decrementCompletedTasks,
    addSessionTask,
    removeSessionTask,
    clearSessionTasks,
    resetStats,
  };
}
