import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { StatsContext } from "./StatsContextDefinition";

interface Stats {
  totalTimeWorked: number; // in seconds
  completedSessions: number;
  completedTasks: number;
}

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<Stats>(() => {
    // Load from localStorage
    const saved = localStorage.getItem("pomodoro-stats");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      totalTimeWorked: 0,
      completedSessions: 0,
      completedTasks: 0,
    };
  });

  const [sessionCompletedTasks, setSessionCompletedTasks] = useState<string[]>(
    []
  );

  // Save to localStorage whenever stats change
  useEffect(() => {
    localStorage.setItem("pomodoro-stats", JSON.stringify(stats));
  }, [stats]);

  const addCompletedSession = (duration: number) => {
    setStats((prev) => ({
      ...prev,
      totalTimeWorked: prev.totalTimeWorked + duration,
      completedSessions: prev.completedSessions + 1,
    }));
  };

  const incrementCompletedTasks = () => {
    setStats((prev) => ({
      ...prev,
      completedTasks: prev.completedTasks + 1,
    }));
  };

  const addSessionTask = (taskText: string) => {
    setSessionCompletedTasks((prev) => [...prev, taskText]);
  };

  const clearSessionTasks = () => {
    setSessionCompletedTasks([]);
  };

  const resetStats = () => {
    setStats({
      totalTimeWorked: 0,
      completedSessions: 0,
      completedTasks: 0,
    });
    setSessionCompletedTasks([]);
  };

  return (
    <StatsContext.Provider
      value={{
        stats,
        sessionCompletedTasks,
        addCompletedSession,
        incrementCompletedTasks,
        addSessionTask,
        clearSessionTasks,
        resetStats,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}
