import { createContext } from "react";

interface Stats {
  totalTimeWorked: number; // in seconds
  completedSessions: number;
  completedTasks: number;
}

export interface StatsContextType {
  stats: Stats;
  sessionCompletedTasks: string[];
  addCompletedSession: (duration: number) => void;
  incrementCompletedTasks: () => void;
  decrementCompletedTasks: () => void;
  addSessionTask: (taskText: string) => void;
  removeSessionTask: (taskText: string) => void;
  clearSessionTasks: () => void;
  resetStats: () => void;
}

export const StatsContext = createContext<StatsContextType | undefined>(
  undefined
);
