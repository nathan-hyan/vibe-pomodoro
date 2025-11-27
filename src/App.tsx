import { usePomodoro } from "./hooks/usePomodoro";
import { Timer } from "./components/Timer";
import { TodoList } from "./components/TodoList";
import { Controls } from "./components/Controls";
import { CompletionModal } from "./components/CompletionModal";
import { Statistics } from "./components/Statistics";
import { SettingsModal } from "./components/SettingsModal";
import { useEffect, useRef, useState } from "react";
import { attachGlowEffect } from "./utils/glowEffect";
import { TodoProvider } from "./contexts/TodoContext";
import { StatsProvider } from "./contexts/StatsContext";
import { useStats } from "./hooks/useStats";

const POMODORO_TIME = 25 * 60; // 25 minutes in seconds

function AppContent() {
  const [state, controls] = usePomodoro(POMODORO_TIME);
  const { sessionCompletedTasks, resetStats } = useStats();
  const [showSettings, setShowSettings] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const todoCardRef = useRef<HTMLDivElement>(null);
  const statsCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    if (cardRef.current) {
      cleanupFunctions.push(attachGlowEffect(cardRef.current));
    }

    if (todoCardRef.current) {
      cleanupFunctions.push(attachGlowEffect(todoCardRef.current));
    }

    if (statsCardRef.current) {
      cleanupFunctions.push(attachGlowEffect(statsCardRef.current));
    }

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <>
      <TodoProvider>
        {state.showCompletionModal && (
          <CompletionModal
            onClose={controls.dismissModal}
            controls={controls}
            completedTasks={sessionCompletedTasks}
          />
        )}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onResetStats={resetStats}
        />
        <div className="min-h-screen bg-linear-to-br from-black via-black to-violet-950 flex items-center justify-center p-4 sm:p-8">
          {/* Settings Button - Fixed Position (Desktop Only) */}
          <button
            onClick={() => setShowSettings(true)}
            className="hidden sm:flex fixed top-8 right-8 z-40 w-14 h-14 items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl border border-white/20 hover:border-white/40 transition-all shadow-lg cursor-pointer"
            aria-label="Settings"
          >
            <span className="text-2xl">⚙️</span>
          </button>
          <div className="w-full max-w-6xl">
            {/* Mobile: Stack vertically, Desktop: Grid 3 columns (1/3 + 2/3) */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8 relative">
              {/* Timer Card - Desktop: 1 column (1/3), Mobile: shows at top */}
              <div
                ref={cardRef}
                className="lg:flex glass-glow cursor-glow bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-4 lg:p-6 border border-white/20 flex flex-col"
              >
                <div className="relative z-10 flex flex-col">
                  <h1 className="text-xl lg:text-2xl font-bold text-white text-center mb-4 lg:mb-6 drop-shadow-lg">
                    🍅 Vibe Pomodoro
                  </h1>

                  <Timer state={state} controls={controls} />
                  <Controls state={state} controls={controls} />

                  {/* Settings Link - Inside Card on Mobile Only */}
                  <div className="lg:hidden mt-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors w-full cursor-pointer"
                    >
                      <span>⚙️</span>
                      <span className="text-sm">Settings</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Todo List and Statistics (2 columns = 2/3) */}
              <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
                {/* Todo List - Top half of right side */}
                <div className="flex-1">
                  <div
                    ref={todoCardRef}
                    className="glass-glow cursor-glow bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20 h-full"
                  >
                    <div className="relative z-10 h-full flex flex-col">
                      <TodoList />
                    </div>
                  </div>
                </div>

                {/* Statistics - Bottom half of right side */}
                <div className="flex-1 hidden lg:block">
                  <div className="h-full">
                    <Statistics ref={statsCardRef} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TodoProvider>
    </>
  );
}

function App() {
  return (
    <StatsProvider>
      <AppContent />
    </StatsProvider>
  );
}

export default App;
