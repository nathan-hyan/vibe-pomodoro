import { usePomodoro } from "./hooks/usePomodoro";
import { Timer } from "./components/Timer";
import { TodoList } from "./components/TodoList";
import { Controls } from "./components/Controls";
import { useEffect, useRef } from "react";
import { attachGlowEffect } from "./utils/glowEffect";

const POMODORO_TIME = 25 * 60; // 25 minutes in seconds

function App() {
  const [state, controls] = usePomodoro(POMODORO_TIME);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      return attachGlowEffect(cardRef.current);
    }
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-950 via-teal-900 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Main Timer Card */}
        <div
          ref={cardRef}
          className="glass-glow cursor-glow bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border border-white/20"
        >
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white text-center mb-12 drop-shadow-lg">
              🍅 Vibe Pomodoro
            </h1>

            <Timer state={state} />
            <TodoList />
            <Controls state={state} controls={controls} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
