import { describe, expect, it } from 'vitest';
import { PaybetaError, PaybetaApiError } from '../src/errors.js';

describe('PaybetaError', () => {
  it('sets message and name, with no cause', () => {
    const err = new PaybetaError('something broke');
    expect(err.message).toBe('something broke');
    expect(err.name).toBe('PaybetaError');
    expect(err.cause).toBeUndefined();
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(PaybetaError);
  });

  it('preserves the original cause when given', () => {
    const original = new TypeError('network down');
    const err = new PaybetaError('wrapped', { cause: original });
    expect(err.cause).toBe(original);
  });
});

describe('PaybetaApiError', () => {
  it('carries status/code/traceId/timestamp and the instanceof chain', () => {
    const err = new PaybetaApiError(404, 'NOT_FOUND', 'Resource not found', 'trace-123', '2026-01-01T00:00:00Z');

    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Resource not found');
    expect(err.traceId).toBe('trace-123');
    expect(err.timestamp).toBe('2026-01-01T00:00:00Z');
    expect(err.name).toBe('PaybetaApiError');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(PaybetaError);
    expect(err).toBeInstanceOf(PaybetaApiError);
  });
});
