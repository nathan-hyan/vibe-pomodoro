# 🧪 Testing Guide - Vibe Pomodoro

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `vitest` - Fast unit test framework
- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - DOM matchers
- `jsdom` - Browser environment for tests
- `@vitest/ui` - Interactive test UI

### 2. Run Tests

```bash
# Watch mode (auto-runs on file changes)
npm test

# Interactive UI (browser-based test explorer)
npm run test:ui

# Coverage report
npm run test:coverage
```

## What's Tested

### ✅ Core Utilities (31 tests)
**File:** `src/utils/handleApiResponse.test.ts`

Tests the API response wrapper that handles apisauce responses:
- ✓ Successful responses with various data types
- ✓ Error handling (network, server, client errors)
- ✓ Edge cases (null, undefined, empty values)

### ✅ Todo Hooks (15 tests)
**File:** `src/hooks/useTodos.test.ts`

Tests all todo CRUD operations with React Query:
- ✓ Fetching todos with sorting
- ✓ Creating todos with optimistic updates
- ✓ Toggling completion status
- ✓ Deleting todos
- ✓ Reordering via drag and drop

### ✅ Drag & Drop (13 tests)
**File:** `src/hooks/useDragging.test.ts`

Tests the drag and drop functionality:
- ✓ Drag lifecycle (start, over, end)
- ✓ State management during drag
- ✓ Filtering of non-draggable items
- ✓ Error handling

## Test Structure