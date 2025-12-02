import { useState } from "react";
import type { ReactNode } from "react";
import { StatsContext } from "./StatsContextDefinition";
import {
  useStatsQuery,
  useAddCompletedSessionMutation,
  useIncrementCompletedTasksMutation,
  useDecrementCompletedTasksMutation,
  useResetStatsMutation,
} from "../hooks/useQueryStats";

export function StatsProvider({ children }: { children: ReactNode }) {
  // React Query hooks
  const { data: stats } = useStatsQuery();
  const addSessionMutation = useAddCompletedSessionMutation();
  const incrementTasksMutation = useIncrementCompletedTasksMutation();
  const decrementTasksMutation = useDecrementCompletedTasksMutation();
  const resetStatsMutation = useResetStatsMutation();

  // Local state for session tasks (not persisted)
  const [sessionCompletedTasks, setSessionCompletedTasks] = useState<string[]>(
    []
  );

  const addCompletedSession = async (duration: number) => {
    addSessionMutation.mutate(duration);
  };

  const incrementCompletedTasks = async () => {
    incrementTasksMutation.mutate();
  };

  const decrementCompletedTasks = async () => {
    decrementTasksMutation.mutate();
  };

  const addSessionTask = (taskText: string) => {
    setSessionCompletedTasks((prev) => [...prev, taskText]);
  };

  const removeSessionTask = (taskText: string) => {
    setSessionCompletedTasks((prev) =>
      prev.filter((task) => task !== taskText)
    );
  };

  const clearSessionTasks = () => {
    setSessionCompletedTasks([]);
  };

  const resetStats = async () => {
    resetStatsMutation.mutate();
    setSessionCompletedTasks([]);
  };

  return (
    <StatsContext.Provider
      value={{
        stats: stats || {
          totalTimeWorked: 0,
          completedSessions: 0,
          completedTasks: 0,
        },
        sessionCompletedTasks,
        addCompletedSession,
        incrementCompletedTasks,
        decrementCompletedTasks,
        addSessionTask,
        removeSessionTask,
        clearSessionTasks,
        resetStats,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}
