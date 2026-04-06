# 🍅 Vibe Pomodoro

A beautiful, modern Pomodoro timer with todo list management and statistics tracking. Built with React, TypeScript, and Vite.

## ✨ Features

- **Pomodoro Timer**: 25-minute focused work sessions with editable time display
- **Focus Tasks**: Three-section task management (Currently working on / Next tasks / Finished) with inline editing, promote/demote, and drag & drop reordering
- **Time-Based Statistics**: Track time worked, sessions done, and tasks done — with today / this week / this month breakdowns on hover
- **Persistent Storage**: All data saved via JSON Server API (not localStorage)
- **Export/Import**: Backup and restore your data anytime via Settings
- **Beautiful UI**: Glassmorphism design with violet gradients, mouse-tracking glow effects, and smooth animations
- **Audio Feedback**: Web Audio API chimes on task completion and alarm on session end
- **Docker Ready**: Easy deployment to Docker, CasaOS, and other container platforms

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
bun install

# Start development servers (JSON Server + Vite)
bun run dev
```

The app will be available at `http://localhost:5173` with the API at `http://localhost:3001`.

### Production Deployment

See **[SETUP.md](./SETUP.md)** for detailed instructions on:

- Docker deployment
- CasaOS configuration
- Environment variables
- Data persistence and backups

## 📦 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite (with Rolldown)
- **Styling**: TailwindCSS 4 (CSS-first config)
- **State Management**: TanStack Query (React Query v5) + `useSyncExternalStore`
- **Backend**: JSON Server (REST API, persistent `db.json`)
- **Optimization**: React Compiler via `babel-plugin-react-compiler`
- **Testing**: Vitest + React Testing Library (unit) / Playwright (E2E)
- **Package Manager**: Bun (npm also supported)

## 💾 Data Persistence

Unlike typical browser-based timers that use localStorage, Vibe Pomodoro uses **JSON Server** to store data in a `db.json` file. This means:

- ✅ Data persists across browser sessions and devices
- ✅ Easy backup and restore via file system
- ✅ Perfect for Docker/CasaOS deployments with volume mounts
- ✅ No data loss when clearing browser cache

## 🐳 Docker & CasaOS

The app includes full Docker support with volume mounting for persistent data:

```bash
# Quick start with Docker Compose
docker-compose up -d

# Your data will be saved in ./data/db.json
```

For CasaOS deployment, use the included `docker-compose.casaos.yml` file. See [SETUP.md](./SETUP.md) for details.

## 📝 Development

```bash
bun install          # Install dependencies
bun run dev          # Start dev servers (JSON Server :3001 + Vite :5173)
bun run build        # TypeScript check + Vite production build
bun run lint         # ESLint
bun run test         # Vitest in watch mode
bun run test:unit    # Vitest single run
bun run test:e2e     # Playwright E2E (needs dev server running)
```

See **[CLAUDE.md](./CLAUDE.md)** for detailed architecture, conventions, and codebase guide.
