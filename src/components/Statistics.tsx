import { forwardRef } from "react";

// TODO: I think new React doesnt need / like the forwardRef anymore. Check.
export const Statistics = forwardRef<HTMLDivElement>((_props, ref) => {
  const stats = {
    totalTimeWorked: 0,
    completedSessions: 0,
    completedTasks: 0,
  };

  const todos = [
    { id: "1", text: "Write today's top 3 tasks", completed: false },
    { id: "2", text: "Start a 25-minute focus session", completed: false },
  ];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const tasksLeft = todos.filter((t) => !t.completed).length;
  const tasksCompleted = todos.filter((t) => t.completed).length;

  const statItems = [
    {
      label: "Time Worked",
      value: formatTime(stats.totalTimeWorked),
      icon: "⏱️",
    },
    {
      label: "Sessions Done",
      value: stats.completedSessions.toString(),
      icon: "🍅",
    },
    {
      label: "Tasks Done",
      value: tasksCompleted.toString(),
      icon: "✓",
    },
    {
      label: "Tasks Left",
      value: tasksLeft.toString(),
      icon: "📝",
    },
  ];

  return (
    <div
      ref={ref}
      className="glass-glow cursor-glow bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20"
    >
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-white mb-3 text-center">
          📊 Statistics
        </h3>
        <div className="space-y-2">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg p-2 px-3 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <span className="text-white/70 text-sm">{item.label}</span>
              </div>
              <span className="text-white font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// TODO: Necessary?
Statistics.displayName = "Statistics";
