# Vibe Pomodoro Setup Guide

## Overview

Vibe Pomodoro now uses **JSON Server** for persistent data storage instead of localStorage. This means your todos and statistics are saved in a `db.json` file that persists across sessions and can be shared across devices when deployed with Docker/CasaOS.

## Local Development

### Prerequisites

- Node.js or Bun installed
- Port 3001 (JSON Server API) and 5173 (Vite dev server) available

### Installation

1. Install dependencies:

```bash
bun install
```

2. Start the development servers:

```bash
bun run dev
```

This will start:

- **JSON Server** on `http://localhost:3001` (API backend)
- **Vite dev server** on `http://localhost:5173` (Frontend)

### Configuration

The app reads the API URL from the `.env` file:

```env
VITE_API_URL=http://localhost:3001
```

## Production Build

### Build the app:

```bash
bun run build
```

### Preview production build locally:

```bash
bun run start
```

This runs both JSON Server and Vite preview server concurrently.

## Docker Deployment

### Building the Docker Image

```bash
docker build -t vibe-pomodoro .
```

### Running with Docker

#### Basic run:

```bash
docker run -p 4173:4173 -p 3001:3001 vibe-pomodoro
```

#### With persistent data volume:

```bash
docker run -p 4173:4173 -p 3001:3001 \
  -v $(pwd)/data:/data \
  -e DB_PATH=/data/db.json \
  vibe-pomodoro
```

### Using Docker Compose

```bash
docker-compose up -d
```

Your data will be persisted in the `./data` directory.

## CasaOS Deployment

### Method 1: Docker Compose (Recommended)

1. Copy `docker-compose.casaos.yml` to your CasaOS system
2. Edit the file to customize:

   - Volume path (default: `/DATA/AppData/vibe-pomodoro`)
   - Ports if needed
   - API URL if accessing remotely

3. In the volumes section, change the source path:

```yaml
volumes:
  - type: bind
    source: /YOUR/PREFERRED/PATH # Change this
    target: /data
```

4. If accessing from another device, update the API URL:

```yaml
environment:
  VITE_API_URL: http://YOUR_CASAOS_IP:3001
```

5. Deploy in CasaOS app store or via command line:

```bash
docker-compose -f docker-compose.casaos.yml up -d
```

### Method 2: Manual Docker Run

```bash
docker run -d \
  --name vibe-pomodoro \
  -p 4173:4173 \
  -p 3001:3001 \
  -v /DATA/AppData/vibe-pomodoro:/data \
  -e DB_PATH=/data/db.json \
  -e VITE_API_URL=http://YOUR_CASAOS_IP:3001 \
  --restart unless-stopped \
  vibe-pomodoro:latest
```

### Accessing Your App

- **Local access**: `http://localhost:4173`
- **Remote access**: `http://YOUR_CASAOS_IP:4173`

## Environment Variables

| Variable       | Description                             | Default                 |
| -------------- | --------------------------------------- | ----------------------- |
| `VITE_API_URL` | URL for the JSON Server API             | `http://localhost:3001` |
| `DB_PATH`      | Path to the database file (Docker only) | `/data/db.json`         |

## Data Persistence

### Local Development

Data is stored in `db.json` in the project root.

### Docker/CasaOS

Data is stored in the mounted volume path. The database structure is:

```json
{
  "todos": [],
  "stats": {
    "totalTimeWorked": 0,
    "completedSessions": 0,
    "completedTasks": 0
  }
}
```

### Backup and Restore

Use the built-in **Export/Import** feature in Settings (⚙️):

- **Export**: Downloads a JSON backup of all your data
- **Import**: Uploads and restores data from a backup file

## Troubleshooting

### Cannot connect to API

- Check that JSON Server is running on port 3001
- Verify `VITE_API_URL` environment variable
- For remote access, ensure firewall allows traffic on ports 3001 and 4173

### Data not persisting in Docker

- Verify volume is properly mounted: `docker inspect vibe-pomodoro`
- Check permissions on the host mount path
- Ensure `DB_PATH` environment variable is set correctly

### App shows empty data after restart

- Check if `db.json` exists in the mounted volume
- Verify JSON Server is running: `curl http://localhost:3001/todos`
- Check Docker logs: `docker logs vibe-pomodoro`

## Port Configuration

If you need to use different ports:

1. **Update `.env` file**:

```env
VITE_API_URL=http://localhost:YOUR_PORT
```

2. **Update Docker/docker-compose**:

```yaml
ports:
  - "YOUR_FRONTEND_PORT:4173"
  - "YOUR_API_PORT:3001"
```

3. **Update package.json** scripts if needed

## Development Notes

- The app uses optimistic UI updates for better UX
- All API calls automatically retry on failure
- Stats are persisted immediately on each change
- Todos support drag-and-drop reordering (persisted to API)
