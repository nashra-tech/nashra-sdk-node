import { DEFAULT_BASE_URL, DEFAULT_MAX_RETRIES, DEFAULT_TIMEOUT, type NashraConfig } from './config';
import { ApiError } from './errors/api-error';
import { AuthenticationError } from './errors/authentication-error';
import { AuthorizationError } from './errors/authorization-error';
import { NotFoundError } from './errors/not-found-error';
import { RateLimitError } from './errors/rate-limit-error';
import { ValidationError } from './errors/validation-error';

export class NashraClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(config: NashraConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
  }

  async get<T>(path: string, params?: object): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(path: string, body?: object): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(path: string, body?: object): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, { method: 'DELETE' });
  }

  private buildUrl(path: string, params?: object): string {
    const url = new URL(`${this.baseUrl}/${path.replace(/^\/+/, '')}`);
    if (params) {
      for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async request<T>(url: string, init: RequestInit, attempt = 0): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
          ...init.headers,
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return (await response.json()) as T;
      }

      // Retry on 429 or 5xx
      if ((response.status === 429 || response.status >= 500) && attempt < this.maxRetries) {
        const retryAfter = response.status === 429
          ? parseInt(response.headers.get('Retry-After') ?? '1', 10) * 1000
          : (attempt + 1) * 1000;
        await this.sleep(retryAfter);
        return this.request<T>(url, init, attempt + 1);
      }

      const body = await response.json().catch(() => ({})) as Record<string, unknown>;
      this.throwForStatus(response.status, body);

      // Unreachable but satisfies TS
      throw new ApiError('Unknown error', response.status, body);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof AuthenticationError || error instanceof AuthorizationError ||
          error instanceof NotFoundError || error instanceof ValidationError ||
          error instanceof RateLimitError || error instanceof ApiError) {
        throw error;
      }
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timed out', 0);
      }
      throw error;
    }
  }

  private throwForStatus(status: number, body: Record<string, unknown>): never {
    const error = (body.error ?? {}) as Record<string, unknown>;
    const message = (error.message ?? 'Unknown error') as string;

    switch (status) {
      case 401:
        throw new AuthenticationError(message, body);
      case 403:
        throw new AuthorizationError(message, body);
      case 404:
        throw new NotFoundError(message, body);
      case 422:
        throw new ValidationError(
          message,
          (error.details ?? {}) as Record<string, string[]>,
          body,
        );
      case 429:
        throw new RateLimitError(60, body);
      default:
        throw new ApiError(message, status, body);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
