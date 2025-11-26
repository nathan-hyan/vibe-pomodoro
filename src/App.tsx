import { usePomodoro } from "./hooks/usePomodoro";
import { Timer } from "./components/Timer";
import { TodoList } from "./components/TodoList";
import { Controls } from "./components/Controls";
import { CompletionModal } from "./components/CompletionModal";
import { useEffect, useRef } from "react";
import { attachGlowEffect } from "./utils/glowEffect";
import { TodoProvider } from "./contexts/TodoContext";

const POMODORO_TIME = 25 * 60; // 25 minutes in seconds

function App() {
  const [state, controls] = usePomodoro(POMODORO_TIME);
  const cardRef = useRef<HTMLDivElement>(null);
  const todoCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    if (cardRef.current) {
      cleanupFunctions.push(attachGlowEffect(cardRef.current));
    }

    if (todoCardRef.current) {
      cleanupFunctions.push(attachGlowEffect(todoCardRef.current));
    }

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <TodoProvider>
      {state.showCompletionModal && (
        <CompletionModal onClose={controls.dismissModal} controls={controls} />
      )}
      <div className="min-h-screen bg-linear-to-br from-black via-black to-violet-950 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch lg:items-start">
            {/* Task List - Left Side on Desktop Only */}
            <div className="hidden lg:block lg:flex-1 lg:max-w-md">
              <div
                ref={todoCardRef}
                className="glass-glow cursor-glow bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20 h-full"
              >
                <div className="relative z-10">
                  <TodoList />
                </div>
              </div>
            </div>

            {/* Timer Card - Right Side on Desktop, Full Width on Mobile */}
            <div className="lg:flex-1 w-full">
              <div
                ref={cardRef}
                className="glass-glow cursor-glow bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-12 border border-white/20"
              >
                <div className="relative z-10">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8 sm:mb-12 drop-shadow-lg">
                    🍅 Vibe Pomodoro
                  </h1>

                  <Timer state={state} />

                  {/* Task List - Inside Timer Card on Mobile Only */}
                  <div className="lg:hidden">
                    <TodoList />
                  </div>

                  <Controls state={state} controls={controls} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TodoProvider>
  );
}

export default App;
