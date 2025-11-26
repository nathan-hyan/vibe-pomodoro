import { usePomodoro } from "./hooks/usePomodoro";
import { Timer } from "./components/Timer";
import { TodoList } from "./components/TodoList";
import { Controls } from "./components/Controls";

const POMODORO_TIME = 25 * 60; // 25 minutes in seconds

function App() {
  const [state, controls] = usePomodoro(POMODORO_TIME);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-950 via-teal-900 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Main Timer Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border border-white/20">
          <h1 className="text-4xl font-bold text-white text-center mb-12 drop-shadow-lg">
            🍅 Vibe Pomodoro
          </h1>

          <Timer state={state} />
          <TodoList />
          <Controls state={state} controls={controls} />
        </div>
      </div>
    </div>
  );
}

export default App;
