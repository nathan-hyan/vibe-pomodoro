interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetStats: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  onResetStats,
}: SettingsModalProps) {
  if (!isOpen) return null;

  const handleResetStats = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all statistics? This cannot be undone."
      )
    ) {
      onResetStats();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-linear-to-br from-violet-900/95 to-purple-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-violet-500/50 p-8 max-w-md w-full animate-[scale-in_0.3s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-2xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Statistics Section */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              Statistics
            </h3>
            <button
              onClick={handleResetStats}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 text-red-300 hover:text-red-200 font-medium py-3 px-4 rounded-lg transition-all cursor-pointer"
            >
              Reset All Statistics
            </button>
            <p className="text-white/50 text-xs mt-2 text-center">
              This will clear all time worked, sessions, and completed tasks
            </p>
          </div>

          {/* Future Settings Placeholder */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              More Settings
            </h3>
            <p className="text-white/40 text-sm text-center py-2">
              Additional settings coming soon...
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/30 transition-all cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
