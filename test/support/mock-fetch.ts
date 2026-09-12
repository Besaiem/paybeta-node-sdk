import { vi } from 'vitest';

export interface MockResponseOptions {
  ok?: boolean;
  status?: number;
  contentType?: string | null;
  /** Used when contentType includes 'application/json'. */
  json?: unknown;
  /** Used when contentType does not include 'application/json'. */
  text?: string;
  /** Make response.json() reject (simulates malformed JSON). */
  jsonThrows?: boolean;
  /** Make response.text() reject. */
  textThrows?: boolean;
}

/**
 * A minimal stand-in for the global `Response` that implements only what
 * HttpClient.request actually reads — lets every branch (malformed JSON,
 * missing content-type, etc.) be forced directly instead of fighting a
 * real Response's own parsing behavior.
 */
export function buildMockResponse(opts: MockResponseOptions = {}) {
  const { ok = true, status = 200, contentType = 'application/json', json, text, jsonThrows, textThrows } = opts;

  return {
    ok,
    status,
    headers: {
      get: (name: string) => (name.toLowerCase() === 'content-type' ? contentType : null),
    },
    json: () => (jsonThrows ? Promise.reject(new Error('bad json')) : Promise.resolve(json)),
    text: () => (textThrows ? Promise.reject(new Error('bad text')) : Promise.resolve(text ?? '')),
  };
}

/** Stubs global fetch with a vi.fn() resolving to the given mock response(s). */
export function stubFetch(...responses: unknown[]) {
  const fn = vi.fn();
  for (const r of responses) {
    fn.mockResolvedValueOnce(r);
  }
  vi.stubGlobal('fetch', fn);
  return fn;
}

/** Stubs global fetch with an implementation, for rejection/abort scenarios. */
export function stubFetchImpl(impl: (...args: unknown[]) => unknown) {
  const fn = vi.fn(impl);
  vi.stubGlobal('fetch', fn);
  return fn;
}
