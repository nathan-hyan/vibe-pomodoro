import {
  useStatsQuery,
  useAddCompletedSessionMutation,
  useIncrementCompletedTasksMutation,
  useDecrementCompletedTasksMutation,
  useResetStatsMutation,
} from "./useQueryStats";
import {
  useSessionTasks,
  addSessionTask,
  removeSessionTask,
  clearSessionTasks,
} from "../stores/sessionTasksStore";

export function useStats() {
  const { data: stats } = useStatsQuery(); // guaranteed non-undefined by useSuspenseQuery
  const addSessionMutation = useAddCompletedSessionMutation();
  const incrementTasksMutation = useIncrementCompletedTasksMutation();
  const decrementTasksMutation = useDecrementCompletedTasksMutation();
  const resetStatsMutation = useResetStatsMutation();
  const sessionCompletedTasks = useSessionTasks();

  const addCompletedSession = (duration: number) => {
    addSessionMutation.mutate(duration);
  };

  const incrementCompletedTasks = () => {
    incrementTasksMutation.mutate();
  };

  const decrementCompletedTasks = () => {
    decrementTasksMutation.mutate();
  };

  const resetStats = () => {
    resetStatsMutation.mutate();
    clearSessionTasks();
  };

  return {
    stats,
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
