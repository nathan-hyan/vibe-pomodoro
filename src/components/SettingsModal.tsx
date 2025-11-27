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

  const handleExport = () => {
    try {
      // Get data from localStorage
      const stats = localStorage.getItem("pomodoro-stats");
      const todos = localStorage.getItem("vibePomodoro_todos");

      const exportData = {
        stats: stats ? JSON.parse(stats) : null,
        todos: todos ? JSON.parse(todos) : null,
        exportDate: new Date().toISOString(),
      };

      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vibe-pomodoro-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          if (
            !window.confirm(
              "This will replace your current data. Are you sure you want to continue?"
            )
          ) {
            return;
          }

          // Import stats
          if (data.stats) {
            localStorage.setItem("pomodoro-stats", JSON.stringify(data.stats));
          }

          // Import todos
          if (data.todos) {
            localStorage.setItem(
              "vibePomodoro_todos",
              JSON.stringify(data.todos)
            );
          }

          alert("Data imported successfully! Refreshing page...");
          window.location.reload();
        } catch (error) {
          console.error("Import failed:", error);
          alert("Failed to import data. Please make sure the file is valid.");
        }
      };
      reader.readAsText(file);
    };

    input.click();
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

          {/* Data Management Section */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-3">
              Data Management
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleExport}
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 hover:border-blue-500 text-blue-300 hover:text-blue-200 font-medium py-3 px-4 rounded-lg transition-all cursor-pointer"
              >
                📥 Export Data
              </button>
              <button
                onClick={handleImport}
                className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 hover:border-green-500 text-green-300 hover:text-green-200 font-medium py-3 px-4 rounded-lg transition-all cursor-pointer"
              >
                📤 Import Data
              </button>
            </div>
            <p className="text-white/50 text-xs mt-2 text-center">
              Export your stats and todos as JSON, or import from a backup
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
