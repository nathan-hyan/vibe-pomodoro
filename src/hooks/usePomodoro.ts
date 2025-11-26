import { useState, useEffect } from "react";
import type { PomodoroState, PomodoroControls } from "../types";

export function usePomodoro(
  initialTime: number
): [PomodoroState, PomodoroControls] {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const stop = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };
  const adjustTime = (seconds: number) => {
    setTimeLeft((prev) => Math.max(0, prev + seconds));
  };

  return [
    { timeLeft, isRunning, totalTime: initialTime },
    { start, pause, stop, adjustTime },
  ];
}
