// API URL resolution order:
// 1. VITE_API_URL env var (set at build time via .env or environment)
// 2. Dynamic resolution based on browser's current location
function getApiUrl(): string {
  // If explicitly configured via env var, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In development (localhost:5173 or localhost:5174), use explicit localhost API
  if (
    window.location.hostname === "localhost" &&
    window.location.port.startsWith("517")
  ) {
    return "http://localhost:3001";
  }

  // In production, always use the current hostname with port 3001
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3001`;
}

const API_URL = getApiUrl();

export default API_URL;
