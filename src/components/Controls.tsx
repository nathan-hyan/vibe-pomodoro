import type { PomodoroState, PomodoroControls } from "../types";

interface ControlsProps {
  state: PomodoroState;
  controls: PomodoroControls;
}

export function Controls({ state, controls }: ControlsProps) {
  const { timeLeft, isRunning, totalTime } = state;
  const { start, pause, stop, adjustTime } = controls;

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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Time Adjustment Buttons */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 max-w-xs mx-auto">
        {/* Minus Buttons */}
        {minusAdjustments.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => adjustTime(value)}
            disabled={isRunning}
            className="bg-red-500/10 hover:bg-red-500/20 backdrop-blur-sm text-red-300 hover:text-red-200 font-medium py-2 px-3 sm:px-4 rounded-lg border border-red-500/30 hover:border-red-500/50 shadow transition-all duration-200 text-xs sm:text-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
            className="bg-violet-500/10 hover:bg-violet-500/20 backdrop-blur-sm text-violet-300 hover:text-violet-200 font-medium py-2 px-3 sm:px-4 rounded-lg border border-violet-500/30 hover:border-violet-500/50 shadow transition-all duration-200 text-xs sm:text-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
            className="bg-linear-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-semibold py-3 px-8 sm:py-4 sm:px-12 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
          >
            {timeLeft === totalTime ? "Start" : "Resume"}
          </button>
        ) : (
          <button
            onClick={pause}
            className="bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-8 sm:py-4 sm:px-12 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-base sm:text-lg cursor-pointer"
          >
            Pause
          </button>
        )}

        <button
          onClick={stop}
          disabled={timeLeft === totalTime && !isRunning}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-8 sm:py-4 sm:px-12 rounded-xl border border-white/30 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
