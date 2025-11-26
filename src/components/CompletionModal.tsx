import type { PomodoroControls } from "../types";

interface CompletionModalProps {
  onClose: () => void;
  controls: PomodoroControls;
}

export function CompletionModal({ onClose, controls }: CompletionModalProps) {
  const handleReset = () => {
    onClose(); // Stop alarm first
    controls.stop();
  };

  const handleAddTime = (minutes: number) => {
    onClose(); // Stop alarm first
    controls.adjustTime(minutes * 60);
    controls.start();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-linear-to-br from-violet-900/95 to-purple-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-violet-500/50 p-8 sm:p-12 max-w-md w-full animate-[scale-in_0.3s_ease-out]">
        {/* Emoji */}
        <div className="text-center mb-6">
          <span className="text-8xl">⏰</span>
        </div>

        {/* Title */}
        <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-4">
          Time's Up!
        </h2>
        <p className="text-white/70 text-center mb-8 text-lg">
          Great work on your focus session!
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleReset}
            className="w-full bg-linear-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-lg"
          >
            Reset Timer
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAddTime(5)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium py-3 px-4 rounded-lg border border-white/30 hover:border-white/50 transition-all text-sm"
            >
              +5 min
            </button>
            <button
              onClick={() => handleAddTime(10)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium py-3 px-4 rounded-lg border border-white/30 hover:border-white/50 transition-all text-sm"
            >
              +10 min
            </button>
            <button
              onClick={() => handleAddTime(15)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium py-3 px-4 rounded-lg border border-white/30 hover:border-white/50 transition-all text-sm"
            >
              +15 min
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
