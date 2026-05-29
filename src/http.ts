import { PaybetaApiError, PaybetaError } from './errors.js';

export interface HttpClientConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    traceId?: string;
    timestamp?: string;
  };
  message?: string;
}

export class HttpClient {
  constructor(private readonly config: HttpClientConfig) {}

  async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      query?: Record<string, string | number | boolean | undefined | null>;
    },
  ): Promise<T> {
    const url = new URL(path, this.config.baseUrl);

    if (options?.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      'X-API-Key': this.config.apiKey,
      Accept: 'application/json',
    };

    let body: string | undefined;
    if (options?.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeout);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method,
        headers,
        body,
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new PaybetaError(`Request timed out after ${this.config.timeout}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }

    let payload: unknown;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      payload = await response.json().catch(() => null);
    } else {
      payload = await response.text().catch(() => null);
    }

    if (!response.ok) {
      const errBody = (payload ?? {}) as ApiErrorBody;
      const errDetail = errBody.error ?? {};
      throw new PaybetaApiError(
        response.status,
        errDetail.code ?? String(response.status),
        errDetail.message ?? errBody.message ?? 'Request failed',
        errDetail.traceId ?? '',
        errDetail.timestamp ?? new Date().toISOString(),
      );
    }

    return payload as T;
  }

  get<T>(path: string, query?: Record<string, string | number | boolean | undefined | null>): Promise<T> {
    return this.request<T>('GET', path, { query });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, { body });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, { body });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}
