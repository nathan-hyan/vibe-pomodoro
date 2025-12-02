# 🍅 Vibe Pomodoro

A beautiful, modern Pomodoro timer with todo list management and statistics tracking. Built with React, TypeScript, and Vite.

## ✨ Features

- **Pomodoro Timer**: 25-minute focused work sessions
- **Todo Management**: Create, complete, and reorder tasks with drag & drop
- **Statistics Tracking**: Monitor your productivity with session and task completion stats
- **Persistent Storage**: All data saved via JSON Server API
- **Export/Import**: Backup and restore your data anytime
- **Beautiful UI**: Modern gradient design with smooth animations
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

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS 4
- **Backend**: JSON Server (for persistent data storage)
- **Build Tool**: Vite with Rolldown
- **Type Safety**: TypeScript with strict mode

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

This project uses:

- **React Compiler**: Enabled for automatic optimization
- **Bun**: Fast package manager and runtime (optional)
- **ESLint**: Configured with strict TypeScript rules

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
