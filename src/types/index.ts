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

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface Stats {
  totalTimeWorked: number; // in seconds
  completedSessions: number;
  completedTasks: number;
}
