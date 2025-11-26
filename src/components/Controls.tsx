import type { PomodoroState, PomodoroControls } from "../types";
import { useState } from "react";

interface ControlsProps {
  state: PomodoroState;
  controls: PomodoroControls;
}

export function Controls({ state, controls }: ControlsProps) {
  const { timeLeft, isRunning, totalTime } = state;
  const { start, pause, stop, adjustTime } = controls;
  const [customTime, setCustomTime] = useState("");

  const minusAdjustments = [
    { label: "−20s", value: -20 },
    { label: "−10s", value: -10 },
    { label: "−5s", value: -5 },
  ];

  const plusAdjustments = [
    { label: "+5s", value: 5 },
    { label: "+10s", value: 10 },
    { label: "+20s", value: 20 },
  ];

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Limit to 4 digits (MMSS)
    const limited = digits.slice(0, 4);

    // Auto-format as MM:SS
    if (limited.length >= 3) {
      const minutes = limited.slice(0, -2);
      const seconds = limited.slice(-2);
      setCustomTime(`${minutes}:${seconds}`);
    } else {
      setCustomTime(limited);
    }
  };

  const handleCustomTimeSet = () => {
    // Parse MM:SS format
    const parts = customTime.split(":");
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      if (!isNaN(minutes) && !isNaN(seconds) && seconds < 60) {
        const totalSeconds = minutes * 60 + seconds;
        const difference = totalSeconds - timeLeft;
        adjustTime(difference);
        setCustomTime("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCustomTimeSet();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Custom Time Input */}
      <div className="flex gap-2 justify-center items-center">
        <input
          type="text"
          value={customTime}
          onChange={handleTimeInputChange}
          onKeyPress={handleKeyPress}
          placeholder="MM:SS"
          disabled={isRunning}
          className="w-24 bg-white/10 backdrop-blur-sm text-white text-center placeholder-white/50 px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleCustomTimeSet}
          disabled={isRunning || !customTime}
          className="bg-violet-500/80 hover:bg-violet-500 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Set
        </button>
      </div>

      {/* Time Adjustment Buttons */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 max-w-xs mx-auto">
        {/* Minus Buttons */}
        {minusAdjustments.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => adjustTime(value)}
            disabled={isRunning}
            className="bg-red-500/10 hover:bg-red-500/20 backdrop-blur-sm text-red-300 hover:text-red-200 font-medium py-2 px-3 sm:px-4 rounded-lg border border-red-500/30 hover:border-red-500/50 shadow transition-all duration-200 text-xs sm:text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {label}
          </button>
        ))}

        {/* Plus Buttons */}
        {plusAdjustments.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => adjustTime(value)}
            disabled={isRunning}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 backdrop-blur-sm text-emerald-300 hover:text-emerald-200 font-medium py-2 px-3 sm:px-4 rounded-lg border border-emerald-500/30 hover:border-emerald-500/50 shadow transition-all duration-200 text-xs sm:text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main Control Buttons */}
      <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
        {!isRunning ? (
          <button
            onClick={start}
            disabled={timeLeft === 0}
            className="bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-8 sm:py-4 sm:px-12 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {timeLeft === totalTime ? "Start" : "Resume"}
          </button>
        ) : (
          <button
            onClick={pause}
            className="bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-8 sm:py-4 sm:px-12 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-base sm:text-lg"
          >
            Pause
          </button>
        )}

        <button
          onClick={stop}
          disabled={timeLeft === totalTime && !isRunning}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-8 sm:py-4 sm:px-12 rounded-xl border border-white/30 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
