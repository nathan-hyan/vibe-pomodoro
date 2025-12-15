# Test Suite

This directory contains the test setup and utilities for the Vibe Pomodoro application.

## Files

- `setup.ts` - Global test setup, extends vitest with jest-dom matchers
- `utils.tsx` - Test utilities including custom render function with React Query provider

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Testing Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const { result } = renderHook(() => useYourHook(), {
  wrapper: createWrapper(),
});
```

### Testing Components

```typescript
import { renderWithProviders } from '../test/utils';

const { getByText } = renderWithProviders(<YourComponent />);
```

## Test Coverage

The test suite covers:
- ✅ `src/utils/handleApiResponse.ts` - API response handling utility (31 tests)
- ✅ `src/hooks/useTodos.ts` - Todo CRUD operations and React Query hooks (15 tests)
- ✅ `src/hooks/useDragging.tsx` - Drag and drop functionality (13 tests)

### Coverage Details

#### handleApiResponse.test.ts
Tests the API response handling utility with comprehensive coverage of:
- Successful responses (various data types: objects, arrays, null, booleans, numbers, strings)
- Error responses (network errors, server errors, client errors, timeouts)
- Edge cases (undefined data, empty objects, zero values, empty strings)

#### useTodos.test.ts
Tests all todo-related hooks:
- `useTodos` - Fetching todos with sorting
- `useCreateTodo` - Creating todos with optimistic updates and index management
- `useToggleTodo` - Toggling todo completion status with proper index assignment
- `useDeleteTodo` - Deleting todos with error handling
- `useReorderTodos` - Reordering incomplete todos via drag and drop

#### useDragging.test.ts
Tests drag and drop functionality:
- Drag start/over/end lifecycle
- State management during drag operations
- Filtering of completed and temporary todos
- Error handling during reorder operations
- Edge cases (empty arrays, single items, invalid states)

Coverage reports are generated in the `coverage/` directory after running `npm run test:coverage`.