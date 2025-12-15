// Dynamic API URL based on browser's current location
// This allows the app to work regardless of how it's accessed (localhost, LAN IP, domain)
function getApiUrl(): string {
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
