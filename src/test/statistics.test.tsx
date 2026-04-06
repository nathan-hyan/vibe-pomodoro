import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Statistics } from "../components/Statistics";
import type { StatEntry, Todo } from "../types";
import type { PeriodStats } from "../hooks/useStats";

// ============ MOCKS ============

const {
  mockResetStats,
  mockAddCompletedSession,
  mockIncrementCompletedTasks,
  mockDecrementCompletedTasks,
  mockClearSessionTasks,
} = vi.hoisted(() => ({
  mockResetStats: vi.fn(),
  mockAddCompletedSession: vi.fn(),
  mockIncrementCompletedTasks: vi.fn(),
  mockDecrementCompletedTasks: vi.fn(),
  mockClearSessionTasks: vi.fn(),
}));

// Shared mutable state — tests set these before rendering
let mockStatEntries: StatEntry[] = [];
let mockDayStats: PeriodStats = { timeWorked: 0, sessions: 0, tasks: 0 };
let mockWeekStats: PeriodStats = { timeWorked: 0, sessions: 0, tasks: 0 };
let mockMonthStats: PeriodStats = { timeWorked: 0, sessions: 0, tasks: 0 };
let mockTodos: Todo[] = [];

vi.mock("../hooks/useStats", () => ({
  useStats: () => ({
    stats: { totalTimeWorked: 0, completedSessions: 0, completedTasks: 0 },
    statEntries: mockStatEntries,
    dayStats: mockDayStats,
    weekStats: mockWeekStats,
    monthStats: mockMonthStats,
    sessionCompletedTasks: [],
    addCompletedSession: mockAddCompletedSession,
    incrementCompletedTasks: mockIncrementCompletedTasks,
    decrementCompletedTasks: mockDecrementCompletedTasks,
    addSessionTask: vi.fn(),
    removeSessionTask: vi.fn(),
    clearSessionTasks: mockClearSessionTasks,
    resetStats: mockResetStats,
  }),
}));

vi.mock("../hooks/useTodos", () => ({
  useTodos: () => ({
    todos: mockTodos,
    workingTodos: mockTodos.filter((t) => t.status === "working"),
    pendingTodos: mockTodos.filter((t) => t.status === "pending"),
    completedTodos: mockTodos.filter((t) => t.status === "completed"),
    addTodo: vi.fn(),
    deleteTodo: vi.fn(),
    editTodo: vi.fn(),
    completeTodo: vi.fn(),
    uncompleteTodo: vi.fn(),
    promoteToWorking: vi.fn(),
    demoteFromWorking: vi.fn(),
    reorderTodos: vi.fn(),
  }),
}));

// ============ HELPERS ============

function makeTodo(overrides: Partial<Todo> & { id: string }): Todo {
  return {
    text: "Test task",
    status: "pending",
    order: 0,
    ...overrides,
  };
}

function setDayStats(stats: Partial<PeriodStats>) {
  mockDayStats = { timeWorked: 0, sessions: 0, tasks: 0, ...stats };
}

function setWeekStats(stats: Partial<PeriodStats>) {
  mockWeekStats = { timeWorked: 0, sessions: 0, tasks: 0, ...stats };
}

function setMonthStats(stats: Partial<PeriodStats>) {
  mockMonthStats = { timeWorked: 0, sessions: 0, tasks: 0, ...stats };
}

function setTodos(todos: Todo[]) {
  mockTodos = todos;
}

// ============ PHASE 1 — DATA LAYER (computePeriodStats + useStats) ============

describe("Phase 1 — data layer (computePeriodStats)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatEntries = [];
    mockDayStats = { timeWorked: 0, sessions: 0, tasks: 0 };
    mockWeekStats = { timeWorked: 0, sessions: 0, tasks: 0 };
    mockMonthStats = { timeWorked: 0, sessions: 0, tasks: 0 };
    mockTodos = [];
  });

  describe("1.1 dayStats with today-only entries", () => {
    it("shows today's time worked", () => {
      setDayStats({ timeWorked: 1500 }); // 25 minutes
      render(<Statistics />);

      expect(screen.getByText("25m")).toBeInTheDocument();
    });

    it("shows today's sessions count", () => {
      setDayStats({ sessions: 3 });
      render(<Statistics />);

      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("shows today's tasks count", () => {
      setDayStats({ tasks: 5 });
      render(<Statistics />);

      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  describe("1.2 zero state", () => {
    it("shows 0m for zero time worked", () => {
      setDayStats({ timeWorked: 0 });
      render(<Statistics />);

      // The time worked row should show "0m"
      const timeRow = screen.getByText("Time Worked").closest("div")!.parentElement!;
      expect(timeRow).toHaveTextContent("0m");
    });

    it("shows 0 for zero sessions", () => {
      setDayStats({ sessions: 0 });
      render(<Statistics />);

      const sessionsRow = screen.getByText("Sessions Done").closest("div")!.parentElement!;
      expect(sessionsRow).toHaveTextContent("0");
    });

    it("shows 0 for zero tasks done", () => {
      setDayStats({ tasks: 0 });
      render(<Statistics />);

      const tasksRow = screen.getByText("Tasks Done").closest("div")!.parentElement!;
      expect(tasksRow).toHaveTextContent("0");
    });
  });

  describe("1.3 tasks left computed from todos", () => {
    it("counts working + pending todos as tasks left", () => {
      setTodos([
        makeTodo({ id: "1", status: "working" }),
        makeTodo({ id: "2", status: "pending" }),
        makeTodo({ id: "3", status: "completed" }),
      ]);
      render(<Statistics />);

      const tasksLeftRow = screen.getByText("Tasks Left").closest("div")!.parentElement!;
      expect(tasksLeftRow).toHaveTextContent("2");
    });

    it("shows 0 tasks left when all completed", () => {
      setTodos([
        makeTodo({ id: "1", status: "completed" }),
        makeTodo({ id: "2", status: "completed" }),
      ]);
      render(<Statistics />);

      const tasksLeftRow = screen.getByText("Tasks Left").closest("div")!.parentElement!;
      expect(tasksLeftRow).toHaveTextContent("0");
    });
  });
});

// ============ PHASE 2 — STATISTICS COMPONENT (UI) ============

describe("Phase 2 — Statistics component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatEntries = [];
    mockDayStats = { timeWorked: 0, sessions: 0, tasks: 0 };
    mockWeekStats = { timeWorked: 0, sessions: 0, tasks: 0 };
    mockMonthStats = { timeWorked: 0, sessions: 0, tasks: 0 };
    mockTodos = [];
  });

  // --- 2.1 Default display ---
  describe("2.1 default display", () => {
    it("renders Statistics heading", () => {
      render(<Statistics />);
      expect(screen.getByText("📊 Statistics")).toBeInTheDocument();
    });

    it("renders Time Worked label with today's value", () => {
      setDayStats({ timeWorked: 1500 });
      render(<Statistics />);

      expect(screen.getByText("Time Worked")).toBeInTheDocument();
      expect(screen.getByText("25m")).toBeInTheDocument();
    });

    it("renders Sessions Done label with today's value", () => {
      setDayStats({ sessions: 2 });
      render(<Statistics />);

      expect(screen.getByText("Sessions Done")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("renders Tasks Done label with today's value", () => {
      setDayStats({ tasks: 4 });
      render(<Statistics />);

      expect(screen.getByText("Tasks Done")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("renders Tasks Left label", () => {
      setTodos([
        makeTodo({ id: "1", status: "pending" }),
        makeTodo({ id: "2", status: "working" }),
      ]);
      render(<Statistics />);

      expect(screen.getByText("Tasks Left")).toBeInTheDocument();
    });

    it("shows verbose time format (hours + minutes)", () => {
      setDayStats({ timeWorked: 5400 }); // 1h 30m
      render(<Statistics />);

      expect(screen.getByText("1h 30m")).toBeInTheDocument();
    });
  });

  // --- 2.2 Hover expansion ---
  describe("2.2 hover expansion", () => {
    it("shows day/week/month on Time Worked hover", () => {
      setDayStats({ timeWorked: 1500 });
      setWeekStats({ timeWorked: 5400 });
      setMonthStats({ timeWorked: 18000 });
      render(<Statistics />);

      // Before hover — only today's value visible
      expect(screen.queryByText("Today")).not.toBeInTheDocument();

      // Hover on the Time Worked row
      const timeRow = screen.getByText("Time Worked").closest("[data-expandable]")!;
      fireEvent.mouseEnter(timeRow);

      // After hover — all three periods visible
      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("This Week")).toBeInTheDocument();
      expect(screen.getByText("This Month")).toBeInTheDocument();
    });

    it("shows day/week/month on Sessions Done hover", () => {
      setDayStats({ sessions: 1 });
      setWeekStats({ sessions: 5 });
      setMonthStats({ sessions: 20 });
      render(<Statistics />);

      const sessionsRow = screen.getByText("Sessions Done").closest("[data-expandable]")!;
      fireEvent.mouseEnter(sessionsRow);

      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("This Week")).toBeInTheDocument();
      expect(screen.getByText("This Month")).toBeInTheDocument();
    });

    it("shows day/week/month on Tasks Done hover", () => {
      setDayStats({ tasks: 2 });
      setWeekStats({ tasks: 8 });
      setMonthStats({ tasks: 30 });
      render(<Statistics />);

      const tasksRow = screen.getByText("Tasks Done").closest("[data-expandable]")!;
      fireEvent.mouseEnter(tasksRow);

      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("This Week")).toBeInTheDocument();
      expect(screen.getByText("This Month")).toBeInTheDocument();
    });

    it("collapses back to single row on mouse leave", () => {
      setDayStats({ timeWorked: 1500 });
      setWeekStats({ timeWorked: 5400 });
      setMonthStats({ timeWorked: 18000 });
      render(<Statistics />);

      const timeRow = screen.getByText("Time Worked").closest("[data-expandable]")!;
      fireEvent.mouseEnter(timeRow);
      expect(screen.getByText("Today")).toBeInTheDocument();

      fireEvent.mouseLeave(timeRow);
      expect(screen.queryByText("Today")).not.toBeInTheDocument();
    });

    it("Tasks Left does NOT expand on hover", () => {
      setTodos([makeTodo({ id: "1", status: "pending" })]);
      render(<Statistics />);

      const tasksLeftRow = screen.getByText("Tasks Left").closest("div")!.parentElement!;
      fireEvent.mouseEnter(tasksLeftRow);

      // Should not show period labels
      expect(screen.queryByText("Today")).not.toBeInTheDocument();
      expect(screen.queryByText("This Week")).not.toBeInTheDocument();
      expect(screen.queryByText("This Month")).not.toBeInTheDocument();
    });
  });

  // --- 2.3 Expanded values ---
  describe("2.3 expanded values", () => {
    it("shows correct time values for each period", () => {
      setDayStats({ timeWorked: 1500 }); // 25m
      setWeekStats({ timeWorked: 5400 }); // 1h 30m
      setMonthStats({ timeWorked: 18000 }); // 5h 0m
      render(<Statistics />);

      const timeRow = screen.getByText("Time Worked").closest("[data-expandable]")!;
      fireEvent.mouseEnter(timeRow);

      expect(screen.getByText("25m")).toBeInTheDocument();
      expect(screen.getByText("1h 30m")).toBeInTheDocument();
      expect(screen.getByText("5h 0m")).toBeInTheDocument();
    });

    it("shows correct session counts for each period", () => {
      setDayStats({ sessions: 1 });
      setWeekStats({ sessions: 5 });
      setMonthStats({ sessions: 20 });
      render(<Statistics />);

      const sessionsRow = screen.getByText("Sessions Done").closest("[data-expandable]")!;
      fireEvent.mouseEnter(sessionsRow);

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
    });

    it("shows correct task counts for each period", () => {
      setDayStats({ tasks: 2 });
      setWeekStats({ tasks: 8 });
      setMonthStats({ tasks: 30 });
      render(<Statistics />);

      const tasksRow = screen.getByText("Tasks Done").closest("[data-expandable]")!;
      fireEvent.mouseEnter(tasksRow);

      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("8")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();
    });

    it("shows 0m for zero time in expanded view", () => {
      setDayStats({ timeWorked: 0 });
      setWeekStats({ timeWorked: 0 });
      setMonthStats({ timeWorked: 1500 });
      render(<Statistics />);

      const timeRow = screen.getByText("Time Worked").closest("[data-expandable]")!;
      fireEvent.mouseEnter(timeRow);

      // All "0m" values should be present
      const zeroValues = screen.getAllByText("0m");
      expect(zeroValues.length).toBeGreaterThanOrEqual(2);
    });
  });
});

// ============ PHASE 3 — SETTINGS (reset) ============

describe("Phase 3 — Settings reset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStatEntries = [];
    mockDayStats = { timeWorked: 0, sessions: 0, tasks: 0 };
    mockWeekStats = { timeWorked: 0, sessions: 0, tasks: 0 };
    mockMonthStats = { timeWorked: 0, sessions: 0, tasks: 0 };
    mockTodos = [];
  });

  it("renders all four stat rows", () => {
    render(<Statistics />);

    expect(screen.getByText("Time Worked")).toBeInTheDocument();
    expect(screen.getByText("Sessions Done")).toBeInTheDocument();
    expect(screen.getByText("Tasks Done")).toBeInTheDocument();
    expect(screen.getByText("Tasks Left")).toBeInTheDocument();
  });

  it("renders stat icons", () => {
    render(<Statistics />);

    expect(screen.getByText("⏱️")).toBeInTheDocument();
    expect(screen.getByText("🍅")).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.getByText("📝")).toBeInTheDocument();
  });
});
