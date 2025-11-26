import type { PomodoroState } from "../types";

interface TimerProps {
  state: PomodoroState;
}

export function Timer({ state }: TimerProps) {
  const { timeLeft, isRunning, totalTime } = state;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
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
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Time Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl sm:text-7xl font-bold text-white drop-shadow-2xl mb-2">
            {formatTime(timeLeft)}
          </div>
          <div className="text-emerald-300 text-xs sm:text-sm font-medium tracking-wider uppercase">
            {timeLeft === 0 ? "Complete!" : isRunning ? "Focus Time" : "Ready"}
          </div>
        </div>
      </div>
    </div>
  );
}
