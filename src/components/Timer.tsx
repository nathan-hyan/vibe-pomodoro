import type { PomodoroState, PomodoroControls } from "../types";
import { useState, useRef, useEffect } from "react";

interface TimerProps {
  state: PomodoroState;
  controls: PomodoroControls;
}

export function Timer({ state, controls }: TimerProps) {
  const { timeLeft, isRunning, totalTime } = state;
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleClick = () => {
    if (!isRunning) {
      setIsEditing(true);
      setInputValue(formatTime(timeLeft));
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    const parts = inputValue.split(":");
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      if (!isNaN(minutes) && !isNaN(seconds) && seconds < 60) {
        const totalSeconds = minutes * 60 + seconds;
        const difference = totalSeconds - timeLeft;
        controls.adjustTime(difference);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, "");
    const limited = digits.slice(0, 4);

    if (limited.length >= 3) {
      const minutes = limited.slice(0, -2);
      const seconds = limited.slice(-2);
      setInputValue(`${minutes}:${seconds}`);
    } else {
      setInputValue(limited);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const radius = 140;
  const mobileRadius = 100;

  return (
    <div className="relative flex items-center justify-center mb-8 sm:mb-12">
      {/* Mobile SVG */}
      <svg className="w-56 h-56 sm:hidden -rotate-90">
        {/* Background Circle */}
        <circle
          cx="50%"
          cy="50%"
          r={mobileRadius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="8"
          fill="none"
        />
        {/* Progress Circle */}
        <circle
          cx="50%"
          cy="50%"
          r={mobileRadius}
          stroke="url(#gradient-mobile)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={2 * Math.PI * mobileRadius}
          strokeDashoffset={2 * Math.PI * mobileRadius * (1 - progress / 100)}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />
        <defs>
          <linearGradient
            id="gradient-mobile"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>

      {/* Desktop SVG */}
      <svg className="hidden sm:block w-80 h-80 -rotate-90">
        {/* Background Circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress Circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="url(#gradient-desktop)"
          strokeWidth="12"
          fill="none"
          strokeDasharray={2 * Math.PI * radius}
          strokeDashoffset={2 * Math.PI * radius * (1 - progress / 100)}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />
        <defs>
          <linearGradient
            id="gradient-desktop"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>

      {/* Time Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              className="text-5xl sm:text-7xl font-bold text-white drop-shadow-2xl mb-2 bg-transparent border-none outline-none text-center w-48 sm:w-64"
              placeholder="MM:SS"
            />
          ) : (
            <div
              onClick={handleClick}
              className={`text-5xl sm:text-7xl font-bold text-white drop-shadow-2xl mb-2 ${
                !isRunning
                  ? "cursor-pointer hover:text-violet-300 transition-colors"
                  : ""
              }`}
              title={!isRunning ? "Click to edit time" : ""}
            >
              {formatTime(timeLeft)}
            </div>
          )}
          <div className="text-violet-300 text-xs sm:text-sm font-medium tracking-wider uppercase">
            {timeLeft === 0 ? "Complete!" : isRunning ? "Focus Time" : "Ready"}
          </div>
        </div>
      </div>
    </div>
  );
}
