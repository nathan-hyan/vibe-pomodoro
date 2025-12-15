import { describe, it, expect } from 'vitest';
import handleApiResponse from './handleApiResponse';
import type { ApiResponse } from 'apisauce';

describe('handleApiResponse', () => {
  describe('successful responses', () => {
    it('should return data when response is ok', () => {
      const mockResponse: ApiResponse<{ id: string; name: string }> = {
        ok: true,
        data: { id: '1', name: 'Test' },
        problem: null,
        originalError: null,
      } as ApiResponse<{ id: string; name: string }>;

      const result = handleApiResponse(mockResponse);

      expect(result).toEqual({ id: '1', name: 'Test' });
    });

    it('should return data with complex nested structure', () => {
      const complexData = {
        user: {
          id: '123',
          profile: {
            name: 'John Doe',
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
      };

      const mockResponse: ApiResponse<typeof complexData> = {
        ok: true,
        data: complexData,
        problem: null,
        originalError: null,
      } as ApiResponse<typeof complexData>;

      const result = handleApiResponse(mockResponse);

      expect(result).toEqual(complexData);
      expect(result.user.profile.settings.theme).toBe('dark');
    });

    it('should handle array responses', () => {
      const mockResponse: ApiResponse<number[]> = {
        ok: true,
        data: [1, 2, 3, 4, 5],
        problem: null,
        originalError: null,
      } as ApiResponse<number[]>;

      const result = handleApiResponse(mockResponse);

      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle null data', () => {
      const mockResponse: ApiResponse<null> = {
        ok: true,
        data: null,
        problem: null,
        originalError: null,
      } as ApiResponse<null>;

      const result = handleApiResponse(mockResponse);

      expect(result).toBeNull();
    });

    it('should handle empty object responses', () => {
      const mockResponse: ApiResponse<Record<string, never>> = {
        ok: true,
        data: {},
        problem: null,
        originalError: null,
      } as ApiResponse<Record<string, never>>;

      const result = handleApiResponse(mockResponse);

      expect(result).toEqual({});
    });
  });

  describe('error responses', () => {
    it('should throw error when response is not ok with problem', () => {
      const mockResponse: ApiResponse<unknown> = {
        ok: false,
        problem: 'NETWORK_ERROR',
        originalError: null,
        data: undefined,
      } as ApiResponse<unknown>;

      expect(() => handleApiResponse(mockResponse)).toThrow(
        'Todos API request failed (problem=NETWORK_ERROR)'
      );
    });

    it('should throw error with original error message', () => {
      const mockResponse: ApiResponse<unknown> = {
        ok: false,
        problem: 'SERVER_ERROR',
        originalError: new Error('Internal server error'),
        data: undefined,
      } as ApiResponse<unknown>;

      expect(() => handleApiResponse(mockResponse)).toThrow(
        'Todos API request failed (problem=SERVER_ERROR error=Internal server error)'
      );
    });

    it('should throw error with string original error', () => {
      const mockResponse: ApiResponse<unknown> = {
        ok: false,
        problem: 'TIMEOUT_ERROR',
        originalError: 'Request timed out',
        data: undefined,
      } as ApiResponse<unknown>;

      expect(() => handleApiResponse(mockResponse)).toThrow(
        'Todos API request failed (problem=TIMEOUT_ERROR error=Request timed out)'
      );
    });

    it('should throw error with object containing message', () => {
      const mockResponse: ApiResponse<unknown> = {
        ok: false,
        problem: 'CLIENT_ERROR',
        originalError: { message: 'Bad request' },
        data: undefined,
      } as ApiResponse<unknown>;

      expect(() => handleApiResponse(mockResponse)).toThrow(
        'Todos API request failed (problem=CLIENT_ERROR error=Bad request)'
      );
    });

    it('should handle unknown error format', () => {
      const mockResponse: ApiResponse<unknown> = {
        ok: false,
        problem: 'UNKNOWN_ERROR',
        originalError: { someProperty: 'value' },
        data: undefined,
      } as ApiResponse<unknown>;

      expect(() => handleApiResponse(mockResponse)).toThrow(
        'Todos API request failed (problem=UNKNOWN_ERROR error=Unknown error)'
      );
    });

    it('should throw generic error when no problem or error details', () => {
      const mockResponse: ApiResponse<unknown> = {
        ok: false,
        problem: null,
        originalError: null,
        data: undefined,
      } as ApiResponse<unknown>;

      expect(() => handleApiResponse(mockResponse)).toThrow(
        'Todos API request failed'
      );
    });

    it('should handle error with problem but no originalError', () => {
      const mockResponse: ApiResponse<unknown> = {
        ok: false,
        problem: 'CONNECTION_ERROR',
        originalError: null,
        data: undefined,
      } as ApiResponse<unknown>;

      expect(() => handleApiResponse(mockResponse)).toThrow(
        'Todos API request failed (problem=CONNECTION_ERROR)'
      );
    });

    it('should handle error with originalError but no problem', () => {
      const mockResponse: ApiResponse<unknown> = {
        ok: false,
        problem: null,
        originalError: 'Something went wrong',
        data: undefined,
      } as ApiResponse<unknown>;

      expect(() => handleApiResponse(mockResponse)).toThrow(
        'Todos API request failed (error=Something went wrong)'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle undefined data when ok is true', () => {
      const mockResponse: ApiResponse<undefined> = {
        ok: true,
        data: undefined,
        problem: null,
        originalError: null,
      } as ApiResponse<undefined>;

      const result = handleApiResponse(mockResponse);

      expect(result).toBeUndefined();
    });

    it('should handle boolean data', () => {
      const mockResponse: ApiResponse<boolean> = {
        ok: true,
        data: true,
        problem: null,
        originalError: null,
      } as ApiResponse<boolean>;

      const result = handleApiResponse(mockResponse);

      expect(result).toBe(true);
    });

    it('should handle zero as valid data', () => {
      const mockResponse: ApiResponse<number> = {
        ok: true,
        data: 0,
        problem: null,
        originalError: null,
      } as ApiResponse<number>;

      const result = handleApiResponse(mockResponse);

      expect(result).toBe(0);
    });

    it('should handle empty string as valid data', () => {
      const mockResponse: ApiResponse<string> = {
        ok: true,
        data: '',
        problem: null,
        originalError: null,
      } as ApiResponse<string>;

      const result = handleApiResponse(mockResponse);

      expect(result).toBe('');
    });
  });
});