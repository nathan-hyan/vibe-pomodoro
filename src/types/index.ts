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
