/**
 * Vitest Global Setup
 * 
 * This file configures the global test environment for the Vibe Pomodoro test suite.
 * 
 * Features:
 * - Extends Vitest with jest-dom matchers for better DOM assertions
 * - Automatically cleans up after each test to prevent state leakage
 * - Provides global expect enhancements for React Testing Library
 * 
 * @see https://vitest.dev/guide/
 * @see https://testing-library.com/docs/react-testing-library/intro/
 */
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});