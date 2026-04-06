import { useState } from "react";
import { useStats } from "../hooks/useStats";
import { useTodos } from "../hooks/useTodos";
import { formatTimeVerbose } from "../utils/formatTime";

function ExpandableStatRow({
  label,
  icon,
  dayValue,
  weekValue,
  monthValue,
  formatValue,
}: {
  label: string;
  icon: string;
  dayValue: number;
  weekValue: number;
  monthValue: number;
  formatValue: (v: number) => string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      data-expandable
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="bg-white/5 hover:bg-white/10 rounded-lg p-2 px-3 transition-all cursor-default"
    >
      {!isExpanded ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span className="text-white/70 text-sm">{label}</span>
          </div>
          <span className="text-white font-semibold">
            {formatValue(dayValue)}
          </span>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">{icon}</span>
            <span className="text-white/70 text-sm font-medium">{label}</span>
          </div>
          <div className="space-y-1 pl-8">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs">Today</span>
              <span className="text-white font-semibold text-sm">
                {formatValue(dayValue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs">This Week</span>
              <span className="text-white/70 font-medium text-sm">
                {formatValue(weekValue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs">This Month</span>
              <span className="text-white/70 font-medium text-sm">
                {formatValue(monthValue)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SimpleStatRow({
  label,
  icon,
  value,
}: {
  label: string;
  icon: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg p-2 px-3 transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-white/70 text-sm">{label}</span>
      </div>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}

export function Statistics({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
  const { dayStats, weekStats, monthStats } = useStats();
  const { todos } = useTodos();

  const tasksLeft = todos.filter((t) => t.status !== "completed").length;

  const formatCount = (v: number) => v.toString();

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
          <ExpandableStatRow
            label="Time Worked"
            icon="⏱️"
            dayValue={dayStats.timeWorked}
            weekValue={weekStats.timeWorked}
            monthValue={monthStats.timeWorked}
            formatValue={formatTimeVerbose}
          />
          <ExpandableStatRow
            label="Sessions Done"
            icon="🍅"
            dayValue={dayStats.sessions}
            weekValue={weekStats.sessions}
            monthValue={monthStats.sessions}
            formatValue={formatCount}
          />
          <ExpandableStatRow
            label="Tasks Done"
            icon="✓"
            dayValue={dayStats.tasks}
            weekValue={weekStats.tasks}
            monthValue={monthStats.tasks}
            formatValue={formatCount}
          />
          <SimpleStatRow
            label="Tasks Left"
            icon="📝"
            value={tasksLeft.toString()}
          />
        </div>
      </div>
    </div>
  );
}
