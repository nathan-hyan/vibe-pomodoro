export interface PomodoroState {
  timeLeft: number;
  isRunning: boolean;
  totalTime: number;
}

export interface PomodoroControls {
  start: () => void;
  pause: () => void;
  stop: () => void;
  adjustTime: (seconds: number) => void;
}

export type TodoStatus = "working" | "pending" | "completed";

export interface Todo {
  id: string;
  text: string;
  status: TodoStatus;
  order: number;
}

export interface Stats {
  totalTimeWorked: number; // in seconds
  completedSessions: number;
  completedTasks: number;
}

export type StatEntryType = "session" | "task";

export interface StatEntry {
  id: string;
  type: StatEntryType;
  value: number; // session: duration in seconds; task: 1 (complete) or -1 (uncomplete)
  timestamp: string; // ISO 8601
}
