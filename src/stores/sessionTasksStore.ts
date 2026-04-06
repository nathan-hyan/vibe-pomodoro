import { useSyncExternalStore } from "react";

// Module-level store for session completed tasks (ephemeral, not persisted)
let sessionTasks: string[] = [];
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return sessionTasks;
}

export function addSessionTask(taskText: string) {
  sessionTasks = [...sessionTasks, taskText];
  emitChange();
}

export function removeSessionTask(taskText: string) {
  sessionTasks = sessionTasks.filter((task) => task !== taskText);
  emitChange();
}

export function clearSessionTasks() {
  sessionTasks = [];
  emitChange();
}

export function useSessionTasks() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
