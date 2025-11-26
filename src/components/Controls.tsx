import type { PomodoroState, PomodoroControls } from "../types";

interface ControlsProps {
  state: PomodoroState;
  controls: PomodoroControls;
}

export function Controls({ state, controls }: ControlsProps) {
  const { timeLeft, isRunning, totalTime } = state;
  const { start, pause, stop } = controls;

  return (
    <div className="flex gap-4 justify-center">
      {!isRunning ? (
        <button
          onClick={start}
          disabled={timeLeft === 0}
          className="bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 px-12 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {timeLeft === totalTime ? "Start" : "Resume"}
        </button>
      ) : (
        <button
          onClick={pause}
          className="bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-4 px-12 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-lg"
        >
          Pause
        </button>
      )}

      <button
        onClick={stop}
        disabled={timeLeft === totalTime && !isRunning}
        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-4 px-12 rounded-xl border border-white/30 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        Reset
      </button>
    </div>
  );
}
