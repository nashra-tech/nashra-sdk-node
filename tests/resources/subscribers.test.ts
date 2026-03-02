import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Nashra } from '../../src/nashra';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const subscriberData = {
  uuid: 'sub-1',
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
  status: 'subscribed',
  tags: [{ uuid: 'tag-1', name: 'VIP', color: '#FF0000', created_at: '2026-01-01T00:00:00Z' }],
  extra_attributes: { company: 'Acme' },
  notes: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('SubscribersResource', () => {
  const nashra = new Nashra('test-key', { maxRetries: 0 });

  it('lists subscribers with pagination', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: [subscriberData],
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z', current_page: 1, last_page: 1, per_page: 15, total: 1, from: 1, to: 1 },
    }));

    const page = await nashra.subscribers.list({ search: 'john' }).getPage();

    expect(page.data).toHaveLength(1);
    expect(page.data[0].email).toBe('john@example.com');
    expect(page.data[0].tags[0].name).toBe('VIP');
    expect(page.total).toBe(1);
    expect(page.hasMorePages).toBe(false);
  });

  it('creates a subscriber', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: { ...subscriberData, uuid: 'sub-new', email: 'jane@example.com' },
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }, 201));

    const subscriber = await nashra.subscribers.create({ email: 'jane@example.com' });

    expect(subscriber.email).toBe('jane@example.com');
    expect(subscriber.uuid).toBe('sub-new');
  });

  it('finds a subscriber by uuid', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: subscriberData,
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }));

    const subscriber = await nashra.subscribers.find('sub-1');

    expect(subscriber.uuid).toBe('sub-1');
    expect(subscriber.email).toBe('john@example.com');
  });

  it('updates a subscriber', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: { ...subscriberData, first_name: 'Jonathan', notes: 'Updated' },
      meta: { version: 'v1', timestamp: '2026-01-02T00:00:00Z' },
    }));

    const subscriber = await nashra.subscribers.update('sub-1', { first_name: 'Jonathan', notes: 'Updated' });

    expect(subscriber.first_name).toBe('Jonathan');
    expect(subscriber.notes).toBe('Updated');
  });

  it('deletes a subscriber', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: [],
      message: 'Subscriber deleted.',
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }));

    const result = await nashra.subscribers.delete('sub-1');

    expect(result.message).toBe('Subscriber deleted.');
  });

  it('auto-paginates through all pages', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({
        data: [{ ...subscriberData, uuid: 'sub-1', email: 'a@e.com' }],
        meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z', current_page: 1, last_page: 2, per_page: 1, total: 2, from: 1, to: 1 },
      }))
      .mockResolvedValueOnce(jsonResponse({
        data: [{ ...subscriberData, uuid: 'sub-2', email: 'b@e.com' }],
        meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z', current_page: 2, last_page: 2, per_page: 1, total: 2, from: 2, to: 2 },
      }));

    const emails: string[] = [];
    for await (const subscriber of nashra.subscribers.list()) {
      emails.push(subscriber.email);
    }

    expect(emails).toEqual(['a@e.com', 'b@e.com']);
  });
});
