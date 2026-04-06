export function isToday(timestamp: string): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function isThisWeek(timestamp: string): boolean {
  const date = new Date(timestamp);
  const now = new Date();

  // Start of week (Monday)
  const startOfWeek = new Date(now);
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0 offset
  startOfWeek.setDate(now.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // End of week (Sunday 23:59:59.999)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return date >= startOfWeek && date < endOfWeek;
}

export function isThisMonth(timestamp: string): boolean {
  const date = new Date(timestamp);
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}
