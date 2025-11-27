import { useState, useEffect, useRef } from "react";
import type { PomodoroState, PomodoroControls } from "../types";
import { useStats } from "./useStats";

export function usePomodoro(
  initialTime: number
): [
  PomodoroState & { showCompletionModal: boolean },
  PomodoroControls & { dismissModal: () => void }
] {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(initialTime);
  const [userSetTime, setUserSetTime] = useState(initialTime);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const { addCompletedSession, clearSessionTasks } = useStats();
  const hasCountedSessionRef = useRef(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setShowCompletionModal(true);
            // Track completed session only once
            if (!hasCountedSessionRef.current) {
              const sessionDuration = sessionStartTime;
              addCompletedSession(sessionDuration);
              hasCountedSessionRef.current = true;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, sessionStartTime, addCompletedSession]);

  const dismissModal = () => {
    setShowCompletionModal(false);
  };

  const start = () => {
    if (!isRunning && timeLeft === sessionStartTime) {
      // Starting fresh session
      setSessionStartTime(timeLeft);
      clearSessionTasks(); // Clear tasks from previous session
    }
    // Reset the session counted flag when starting
    hasCountedSessionRef.current = false;
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);

  const stop = () => {
    setIsRunning(false);
    setTimeLeft(userSetTime);
    setSessionStartTime(userSetTime);
    setShowCompletionModal(false);
  };

  const adjustTime = (seconds: number) => {
    const newTime = Math.max(0, timeLeft + seconds);
    setTimeLeft(newTime);
    // Update session start time when adjusting while not running
    if (!isRunning) {
      setSessionStartTime(newTime);
      setUserSetTime(newTime); // Remember this as the user's chosen time
    }
  };

  return [
    { timeLeft, isRunning, totalTime: sessionStartTime, showCompletionModal },
    { start, pause, stop, adjustTime, dismissModal },
  ];
}
