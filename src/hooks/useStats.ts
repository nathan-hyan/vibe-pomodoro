import { useContext } from "react";
import { StatsContext } from "../contexts/StatsContextDefinition";

// TODO: Consider changing from useStats to useStatistics for readability
export function useStats() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error("useStats must be used within a StatsProvider");
  }
  return context;
}
