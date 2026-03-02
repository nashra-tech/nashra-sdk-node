import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NashraClient } from '../src/client';
import { ApiError } from '../src/errors/api-error';
import { AuthenticationError } from '../src/errors/authentication-error';
import { AuthorizationError } from '../src/errors/authorization-error';
import { NotFoundError } from '../src/errors/not-found-error';
import { RateLimitError } from '../src/errors/rate-limit-error';
import { ValidationError } from '../src/errors/validation-error';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

describe('NashraClient', () => {
  const client = new NashraClient({ apiKey: 'test-key', maxRetries: 0 });

  it('sends authorization header', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: [], meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' } }));

    await client.get('/subscribers');

    expect(mockFetch).toHaveBeenCalledOnce();
    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer test-key');
    expect(init.headers.Accept).toBe('application/json');
  });

  it('sends GET requests with query parameters', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: [], meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' } }));

    await client.get('/subscribers', { search: 'john', per_page: 50 });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('search=john');
    expect(url).toContain('per_page=50');
  });

  it('sends POST requests with body', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: { uuid: 'abc', email: 'j@e.com' }, meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' } }, 201));

    const result = await client.post<{ data: { email: string } }>('/subscribers', { email: 'j@e.com' });

    expect(result.data.email).toBe('j@e.com');
    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ email: 'j@e.com' });
  });

  it('sends PATCH requests', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: { uuid: 'abc', name: 'Updated' }, meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' } }));

    await client.patch('/tags/abc', { name: 'Updated' });

    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe('PATCH');
  });

  it('sends DELETE requests', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: [], message: 'Deleted.', meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' } }));

    const result = await client.delete<{ message: string }>('/subscribers/abc');

    expect(result.message).toBe('Deleted.');
  });

  it('throws AuthenticationError on 401', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      error: { message: 'Unauthenticated.', code: 'INVALID_TOKEN' },
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }, 401));

    await expect(client.get('/subscribers')).rejects.toThrow(AuthenticationError);
  });

  it('throws AuthorizationError on 403', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      error: { message: 'No newsletter configured.', code: 'MISSING_NEWSLETTER' },
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }, 403));

    await expect(client.get('/subscribers')).rejects.toThrow(AuthorizationError);
  });

  it('throws NotFoundError on 404', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      error: { message: 'Resource not found', code: 'NOT_FOUND' },
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }, 404));

    await expect(client.get('/subscribers/nonexistent')).rejects.toThrow(NotFoundError);
  });

  it('throws ValidationError on 422 with field errors', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      error: {
        message: 'The given data was invalid.',
        code: 'VALIDATION_ERROR',
        details: { email: ['The email field is required.'] },
      },
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }, 422));

    try {
      await client.post('/subscribers', {});
      expect.fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).details).toEqual({ email: ['The email field is required.'] });
    }
  });

  it('throws RateLimitError on 429', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      error: { message: 'Too many requests', code: 'RATE_LIMITED' },
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }, 429, { 'Retry-After': '30' }));

    await expect(client.get('/subscribers')).rejects.toThrow(RateLimitError);
  });

  it('throws ApiError on 500', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      error: { message: 'Internal server error', code: 'SERVER_ERROR' },
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }, 500));

    await expect(client.get('/subscribers')).rejects.toThrow(ApiError);
  });

  it('retries on 429 when retries enabled', async () => {
    const retryClient = new NashraClient({ apiKey: 'test-key', maxRetries: 1 });

    mockFetch
      .mockResolvedValueOnce(jsonResponse({
        error: { message: 'Too many requests', code: 'RATE_LIMITED' },
      }, 429, { 'Retry-After': '0' }))
      .mockResolvedValueOnce(jsonResponse({ data: [], meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' } }));

    const result = await retryClient.get<{ data: unknown[] }>('/subscribers');

    expect(result.data).toEqual([]);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('retries on 500 when retries enabled', async () => {
    const retryClient = new NashraClient({ apiKey: 'test-key', maxRetries: 1 });

    mockFetch
      .mockResolvedValueOnce(jsonResponse({
        error: { message: 'Internal error', code: 'SERVER_ERROR' },
      }, 500))
      .mockResolvedValueOnce(jsonResponse({ data: [], meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' } }));

    const result = await retryClient.get<{ data: unknown[] }>('/subscribers');

    expect(result.data).toEqual([]);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
