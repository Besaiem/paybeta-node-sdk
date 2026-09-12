import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '../src/http.js';
import { PaybetaApiError, PaybetaError } from '../src/errors.js';
import { buildMockResponse, stubFetch, stubFetchImpl } from './support/mock-fetch.js';

function makeClient(overrides: Partial<{ apiKey: string; baseUrl: string; timeout: number }> = {}) {
  return new HttpClient({
    apiKey: 'pb_test_key',
    baseUrl: 'https://api.usepaybeta.com',
    timeout: 30_000,
    ...overrides,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('HttpClient.request — URL and headers', () => {
  it('always prefixes the path with /v1', async () => {
    const fetchMock = stubFetch(buildMockResponse({ json: { ok: true } }));
    await makeClient().get('/transactions/tx_1');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.usepaybeta.com/v1/transactions/tx_1',
      expect.anything(),
    );
  });

  it('serializes query params and skips undefined/null values', async () => {
    const fetchMock = stubFetch(buildMockResponse({ json: [] }));
    await makeClient().get('/transactions', { status: 'PENDING', limit: 10, flag: true, skip: undefined, missing: null });

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get('status')).toBe('PENDING');
    expect(calledUrl.searchParams.get('limit')).toBe('10');
    expect(calledUrl.searchParams.get('flag')).toBe('true');
    expect(calledUrl.searchParams.has('skip')).toBe(false);
    expect(calledUrl.searchParams.has('missing')).toBe(false);
  });

  it('sends X-API-Key and Accept but no Content-Type/body on a bodyless request', async () => {
    const fetchMock = stubFetch(buildMockResponse({ json: {} }));
    await makeClient({ apiKey: 'pb_live_abc' }).get('/transactions');

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers['X-API-Key']).toBe('pb_live_abc');
    expect(headers.Accept).toBe('application/json');
    expect(headers['Content-Type']).toBeUndefined();
    expect(init.body).toBeUndefined();
  });

  it('sends Content-Type and a JSON-stringified body on a POST', async () => {
    const fetchMock = stubFetch(buildMockResponse({ json: {} }));
    await makeClient().post('/transactions', { amount: 500 });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ amount: 500 }));
  });
});

describe('HttpClient.request — network failures', () => {
  it('wraps an AbortError as a timeout PaybetaError', async () => {
    stubFetchImpl(() => {
      const err = new Error('aborted');
      err.name = 'AbortError';
      return Promise.reject(err);
    });

    await expect(makeClient({ timeout: 5000 }).get('/x')).rejects.toThrow(
      /Request timed out after 5000ms/,
    );
  });

  it('wraps a generic Error from fetch with its message', async () => {
    stubFetchImpl(() => Promise.reject(new TypeError('getaddrinfo ENOTFOUND')));

    await expect(makeClient().get('/x')).rejects.toMatchObject({
      message: expect.stringContaining('getaddrinfo ENOTFOUND'),
    });
    await expect(makeClient().get('/x')).rejects.toBeInstanceOf(PaybetaError);
  });

  it('wraps a non-Error thrown value from fetch via String(err)', async () => {
    stubFetchImpl(() => Promise.reject('connection reset'));

    await expect(makeClient().get('/x')).rejects.toMatchObject({
      message: expect.stringContaining('connection reset'),
    });
  });

  it('actually aborts the in-flight request once the timeout elapses', async () => {
    stubFetchImpl(
      (_url: unknown, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          const signal = init.signal as AbortSignal;
          signal.addEventListener('abort', () => {
            const err = new Error('aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }),
    );

    await expect(makeClient({ timeout: 10 }).get('/slow')).rejects.toThrow(/Request timed out after 10ms/);
  });
});

describe('HttpClient.request — response body parsing', () => {
  it('parses a JSON body when content-type is application/json', async () => {
    stubFetch(buildMockResponse({ contentType: 'application/json', json: { id: 'tx_1' } }));
    const result = await makeClient().get('/transactions/tx_1');
    expect(result).toEqual({ id: 'tx_1' });
  });

  it('falls back to null when the JSON body fails to parse', async () => {
    stubFetch(buildMockResponse({ contentType: 'application/json', jsonThrows: true }));
    const result = await makeClient().get('/transactions/tx_1');
    expect(result).toBeNull();
  });

  it('reads a text body when content-type is not application/json', async () => {
    stubFetch(buildMockResponse({ contentType: 'text/plain', text: 'pong' }));
    const result = await makeClient().get('/ping');
    expect(result).toBe('pong');
  });

  it('falls back to null when the text body fails to read', async () => {
    stubFetch(buildMockResponse({ contentType: 'text/plain', textThrows: true }));
    const result = await makeClient().get('/ping');
    expect(result).toBeNull();
  });

  it('treats a missing content-type header as non-JSON', async () => {
    stubFetch(buildMockResponse({ contentType: null, text: 'no content type' }));
    const result = await makeClient().get('/ping');
    expect(result).toBe('no content type');
  });
});

describe('HttpClient.request — success envelope unwrapping', () => {
  it('unwraps { status: success, data, timestamp } to just data', async () => {
    stubFetch(
      buildMockResponse({
        json: { status: 'success', data: { id: 'tx_1' }, timestamp: '2026-01-01T00:00:00Z' },
      }),
    );
    const result = await makeClient().get('/transactions/tx_1');
    expect(result).toEqual({ id: 'tx_1' });
  });

  it('passes through a bare payload with no envelope shape', async () => {
    stubFetch(buildMockResponse({ json: { id: 'tx_1', status: 'COMPLETED' } }));
    const result = await makeClient().get('/transactions/tx_1');
    expect(result).toEqual({ id: 'tx_1', status: 'COMPLETED' });
  });

  it('passes through a payload missing the data key even if status is success', async () => {
    stubFetch(buildMockResponse({ json: { status: 'success', timestamp: '2026-01-01T00:00:00Z' } }));
    const result = await makeClient().get('/x');
    expect(result).toEqual({ status: 'success', timestamp: '2026-01-01T00:00:00Z' });
  });

  it('passes through a payload where timestamp is not a string', async () => {
    const payload = { status: 'success', data: { id: 1 }, timestamp: 12345 };
    stubFetch(buildMockResponse({ json: payload }));
    const result = await makeClient().get('/x');
    expect(result).toEqual(payload);
  });

  it('passes through an array payload untouched', async () => {
    stubFetch(buildMockResponse({ json: [{ id: 'tx_1' }, { id: 'tx_2' }] }));
    const result = await makeClient().get('/transactions');
    expect(result).toEqual([{ id: 'tx_1' }, { id: 'tx_2' }]);
  });

  it('passes through a null payload untouched', async () => {
    stubFetch(buildMockResponse({ json: null }));
    const result = await makeClient().get('/x');
    expect(result).toBeNull();
  });
});

describe('HttpClient.request — error responses', () => {
  it('throws PaybetaApiError with the full error body when present', async () => {
    stubFetch(
      buildMockResponse({
        ok: false,
        status: 404,
        json: { error: { code: 'NOT_FOUND', message: 'Transaction not found', traceId: 'trace-1', timestamp: '2026-01-01T00:00:00Z' } },
      }),
    );

    await expect(makeClient().get('/transactions/missing')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: 'Transaction not found',
      traceId: 'trace-1',
      timestamp: '2026-01-01T00:00:00Z',
    });
  });

  it('throws PaybetaApiError, instanceof check', async () => {
    stubFetch(buildMockResponse({ ok: false, status: 500, json: { error: { message: 'boom' } } }));
    await expect(makeClient().get('/x')).rejects.toBeInstanceOf(PaybetaApiError);
  });

  it('falls back to defaults when the error body is an empty error object', async () => {
    const before = Date.now();
    stubFetch(buildMockResponse({ ok: false, status: 503, json: { error: {} } }));

    await expect(makeClient().get('/x')).rejects.toMatchObject({
      status: 503,
      code: '503',
      message: 'Request failed',
      traceId: '',
    });
    void before;
  });

  it('falls back to a bare message with no error key', async () => {
    stubFetch(buildMockResponse({ ok: false, status: 400, json: { message: 'Bad input' } }));
    await expect(makeClient().get('/x')).rejects.toMatchObject({ status: 400, message: 'Bad input' });
  });

  it('falls back to defaults entirely when the payload is null', async () => {
    stubFetch(buildMockResponse({ ok: false, status: 502, json: null }));
    await expect(makeClient().get('/x')).rejects.toMatchObject({
      status: 502,
      code: '502',
      message: 'Request failed',
      traceId: '',
    });
  });
});

describe('HttpClient method shortcuts', () => {
  it('get/post/patch/delete all forward to request with the right method', async () => {
    const client = makeClient();
    const spy = vi.spyOn(client, 'request').mockResolvedValue({ ok: true } as never);

    await client.get('/a', { x: 1 });
    expect(spy).toHaveBeenLastCalledWith('GET', '/a', { query: { x: 1 } });

    await client.post('/b', { y: 2 });
    expect(spy).toHaveBeenLastCalledWith('POST', '/b', { body: { y: 2 } });

    await client.patch('/c', { z: 3 });
    expect(spy).toHaveBeenLastCalledWith('PATCH', '/c', { body: { z: 3 } });

    await client.delete('/d');
    expect(spy).toHaveBeenLastCalledWith('DELETE', '/d');
  });
});
