import { useStats } from "../hooks/useStats";
import { useTodos } from "../hooks/useTodos";
import { formatTimeVerbose } from "../utils/formatTime";

export function Statistics({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
  const { stats } = useStats();
  const { todos } = useTodos();

  const tasksLeft = todos.filter((t) => !t.completed).length;
  const tasksCompleted = todos.filter((t) => t.completed).length;

  const statItems = [
    {
      label: "Time Worked",
      value: formatTimeVerbose(stats.totalTimeWorked),
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
}
