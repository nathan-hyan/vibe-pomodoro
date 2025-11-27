import type { PomodoroControls } from "../types";

interface CompletionModalProps {
  onClose: () => void;
  controls: PomodoroControls;
  completedTasks: string[];
}

export function CompletionModal({
  onClose,
  controls,
  completedTasks,
}: CompletionModalProps) {
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
        <p className="text-white/70 text-center mb-6 text-lg">
          Great work on your focus session!
        </p>

        {/* Completed Tasks List */}
        {completedTasks.length > 0 && (
          <div className="mb-6 bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-3 text-center">
              ✓ You completed these tasks:
            </h3>
            <ul className="space-y-2">
              {completedTasks.map((task, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-white/90"
                >
                  <span className="text-violet-400 mt-0.5">•</span>
                  <span className="flex-1">{task}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleReset}
            className="w-full bg-linear-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-lg cursor-pointer"
          >
            Stop Session
          </button>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleAddTime(5)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium py-3 px-3 rounded-lg border border-white/30 hover:border-white/50 transition-all text-sm cursor-pointer"
            >
              +5
            </button>
            <button
              onClick={() => handleAddTime(10)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium py-3 px-3 rounded-lg border border-white/30 hover:border-white/50 transition-all text-sm cursor-pointer"
            >
              +10
            </button>
            <button
              onClick={() => handleAddTime(15)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium py-3 px-3 rounded-lg border border-white/30 hover:border-white/50 transition-all text-sm cursor-pointer"
            >
              +15
            </button>
            <button
              onClick={() => handleAddTime(20)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium py-3 px-3 rounded-lg border border-white/30 hover:border-white/50 transition-all text-sm cursor-pointer"
            >
              +20
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
