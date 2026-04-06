import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { usePomodoro } from "../hooks/usePomodoro";
import { Timer } from "../components/Timer";
import { Controls } from "../components/Controls";
import { CompletionModal } from "../components/CompletionModal";

const { mockAddCompletedSession, mockClearSessionTasks, mockPlayAlarmSoundOnce } =
  vi.hoisted(() => ({
    mockAddCompletedSession: vi.fn(),
    mockClearSessionTasks: vi.fn(),
    mockPlayAlarmSoundOnce: vi.fn(),
  }));

vi.mock("../hooks/useStats", () => ({
  useStats: () => ({
    addCompletedSession: mockAddCompletedSession,
    clearSessionTasks: mockClearSessionTasks,
    sessionCompletedTasks: [],
  }),
}));

vi.mock("../utils/alarmSound", () => ({
  playAlarmSoundOnce: mockPlayAlarmSoundOnce,
}));

function PomodoroTestHarness({ initialTime = 300 }: { initialTime?: number }) {
  const [state, controls] = usePomodoro(initialTime);
  return (
    <>
      <Timer state={state} controls={controls} />
      <Controls state={state} controls={controls} />
      {state.showCompletionModal && (
        <CompletionModal
          onClose={controls.dismissModal}
          controls={controls}
          completedTasks={[]}
        />
      )}
    </>
  );
}

describe("Pomodoro Timer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const advanceTimer = async (seconds: number) => {
    await act(async () => {
      vi.advanceTimersByTime(seconds * 1000);
    });
  };

  // 1. Starts the timer
  describe("1. starts the timer", () => {
    it("displays the initial time before starting", () => {
      render(<PomodoroTestHarness initialTime={300} />);
      expect(screen.getByText("05:00")).toBeInTheDocument();
      expect(screen.getByText("Ready")).toBeInTheDocument();
    });

    it("counts down each second after clicking Start", async () => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(1);
      expect(screen.getByText("04:59")).toBeInTheDocument();
      await advanceTimer(1);
      expect(screen.getByText("04:58")).toBeInTheDocument();
    });

    it('shows "Focus Time" status while running', async () => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      expect(screen.getByText("Focus Time")).toBeInTheDocument();
    });
  });

  // 2. Stops the timer
  describe("2. stops the timer", () => {
    it("stops and resets to initial time when Reset is clicked", async () => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(10);
      expect(screen.getByText("04:50")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(screen.getByText("05:00")).toBeInTheDocument();
      expect(screen.getByText("Ready")).toBeInTheDocument();
    });
  });

  // 3. Pauses the timer
  describe("3. pauses the timer", () => {
    it("stops counting when Pause is clicked", async () => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(5);
      expect(screen.getByText("04:55")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Pause" }));
      await advanceTimer(10);
      expect(screen.getByText("04:55")).toBeInTheDocument();
    });

    it("shows Pause button only while running", async () => {
      render(<PomodoroTestHarness initialTime={300} />);
      expect(
        screen.queryByRole("button", { name: "Pause" })
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      expect(
        screen.getByRole("button", { name: "Pause" })
      ).toBeInTheDocument();
    });
  });

  // 4. Resumes the timer
  describe("4. resumes the timer", () => {
    it("continues counting down from the paused time", async () => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(5);
      fireEvent.click(screen.getByRole("button", { name: "Pause" }));
      expect(screen.getByText("04:55")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Resume" }));
      await advanceTimer(5);
      expect(screen.getByText("04:50")).toBeInTheDocument();
      expect(screen.getByText("Focus Time")).toBeInTheDocument();
    });

    it("shows Resume (not Start) when paused mid-session", async () => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(3);
      fireEvent.click(screen.getByRole("button", { name: "Pause" }));
      expect(
        screen.getByRole("button", { name: "Resume" })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Start" })
      ).not.toBeInTheDocument();
    });
  });

  // 5. Adds time when stopped
  describe("5. adds time when stopped", () => {
    it.each([
      { label: "+5s", expected: "05:05" },
      { label: "+10s", expected: "05:10" },
      { label: "+20s", expected: "05:20" },
    ])("adds $label → $expected", async ({ label, expected }) => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  // 6. Removes time when stopped
  describe("6. removes time when stopped", () => {
    it.each([
      { label: "-5s", expected: "04:55" },
      { label: "-10s", expected: "04:50" },
      { label: "-20s", expected: "04:40" },
    ])("removes $label → $expected", async ({ label, expected }) => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it("does not go below 0", async () => {
      render(<PomodoroTestHarness initialTime={10} />);
      fireEvent.click(screen.getByRole("button", { name: "-20s" }));
      expect(screen.getByText("00:00")).toBeInTheDocument();
    });
  });

  // 7. Adds time when running
  describe("7. adds time when running", () => {
    it.each([
      { label: "+5s", expected: "04:55" },
      { label: "+10s", expected: "05:00" },
      { label: "+20s", expected: "05:10" },
    ])(
      "adds $label while running → $expected",
      async ({ label, expected }) => {
        render(<PomodoroTestHarness initialTime={300} />);
        fireEvent.click(screen.getByRole("button", { name: "Start" }));
        await advanceTimer(10); // 04:50
        fireEvent.click(screen.getByRole("button", { name: label }));
        expect(screen.getByText(expected)).toBeInTheDocument();
      }
    );

    it("continues counting after adding time while running", async () => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(10);
      fireEvent.click(screen.getByRole("button", { name: "+20s" }));
      expect(screen.getByText("05:10")).toBeInTheDocument();
      await advanceTimer(5);
      expect(screen.getByText("05:05")).toBeInTheDocument();
    });
  });

  // 8. Removes time when running
  describe("8. removes time when running", () => {
    it.each([
      { label: "-5s", expected: "04:45" },
      { label: "-10s", expected: "04:40" },
      { label: "-20s", expected: "04:30" },
    ])(
      "removes $label while running → $expected",
      async ({ label, expected }) => {
        render(<PomodoroTestHarness initialTime={300} />);
        fireEvent.click(screen.getByRole("button", { name: "Start" }));
        await advanceTimer(10); // 04:50
        fireEvent.click(screen.getByRole("button", { name: label }));
        expect(screen.getByText(expected)).toBeInTheDocument();
      }
    );

    it("continues counting after removing time while running", async () => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(10);
      fireEvent.click(screen.getByRole("button", { name: "-5s" }));
      expect(screen.getByText("04:45")).toBeInTheDocument();
      await advanceTimer(5);
      expect(screen.getByText("04:40")).toBeInTheDocument();
    });
  });

  // 9. Resets the timer when stopped
  describe("9. resets the timer when stopped", () => {
    it("resets to user-set time after adjustments, start, pause, and reset", async () => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByRole("button", { name: "+20s" }));
      expect(screen.getByText("05:20")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(10);
      fireEvent.click(screen.getByRole("button", { name: "Pause" }));
      expect(screen.getByText("05:10")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(screen.getByText("05:20")).toBeInTheDocument();
    });
  });

  // 10. Resets and stops the timer when running
  describe("10. resets and stops the timer when running", () => {
    it("stops and resets to user-set time in one action", async () => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(30);
      expect(screen.getByText("04:30")).toBeInTheDocument();
      expect(screen.getByText("Focus Time")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(screen.getByText("05:00")).toBeInTheDocument();
      expect(screen.getByText("Ready")).toBeInTheDocument();

      // Verify timer is truly stopped
      await advanceTimer(5);
      expect(screen.getByText("05:00")).toBeInTheDocument();
    });

    it("running adjustments are lost on reset", async () => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(10);
      fireEvent.click(screen.getByRole("button", { name: "+20s" }));
      expect(screen.getByText("05:10")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(screen.getByText("05:00")).toBeInTheDocument();
    });
  });

  // 11. Custom time input when stopped
  describe("11. custom time input when stopped", () => {
    it("allows entering a custom time via the time display", async () => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByText("05:00"));

      const input = screen.getByPlaceholderText("MM:SS");
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: "10:00" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(screen.getByText("10:00")).toBeInTheDocument();
    });

    it("does not allow editing while running", async () => {
      render(<PomodoroTestHarness initialTime={300} />);
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(2);

      // Clicking the time display should not open the input
      fireEvent.click(screen.getByText("04:58"));
      expect(screen.queryByPlaceholderText("MM:SS")).not.toBeInTheDocument();
    });
  });

  // 12. Timer completion — modal and chime
  describe("12. timer completion (modal + chime)", () => {
    it("shows completion modal when timer reaches 0", async () => {
      render(<PomodoroTestHarness initialTime={3} />);
      expect(screen.getByText("00:03")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(3);

      expect(screen.getByText("Time's Up!")).toBeInTheDocument();
      expect(screen.getByText("Complete!")).toBeInTheDocument();
    });

    it("plays alarm sound when timer reaches 0", async () => {
      render(<PomodoroTestHarness initialTime={3} />);
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(3);

      expect(mockPlayAlarmSoundOnce).toHaveBeenCalledOnce();
    });

    it("records the completed session", async () => {
      render(<PomodoroTestHarness initialTime={3} />);
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(3);

      expect(mockAddCompletedSession).toHaveBeenCalledWith(3);
    });

    it("can dismiss modal via Stop Session", async () => {
      render(<PomodoroTestHarness initialTime={3} />);
      fireEvent.click(screen.getByRole("button", { name: "Start" }));
      await advanceTimer(3);
      expect(screen.getByText("Time's Up!")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Stop Session" }));
      expect(screen.queryByText("Time's Up!")).not.toBeInTheDocument();
    });
  });
});
