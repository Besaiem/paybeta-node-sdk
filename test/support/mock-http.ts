import { vi } from 'vitest';

/**
 * A fake HttpClient for resource unit tests — no real HttpClient or fetch
 * involved, just assertable spies that resolve to whatever the test sets up.
 */
export function createMockHttp() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
}

export type MockHttp = ReturnType<typeof createMockHttp>;
