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

describe('TagsResource', () => {
  const nashra = new Nashra('test-key', { maxRetries: 0 });

  it('lists tags', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: [
        { uuid: 'tag-1', name: 'VIP', color: '#FF0000', created_at: '2026-01-01T00:00:00Z' },
        { uuid: 'tag-2', name: 'New', color: '#00FF00', created_at: '2026-01-01T00:00:00Z' },
      ],
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z', current_page: 1, last_page: 1, per_page: 15, total: 2, from: 1, to: 2 },
    }));

    const page = await nashra.tags.list().getPage();

    expect(page.data).toHaveLength(2);
    expect(page.data[0].name).toBe('VIP');
    expect(page.data[1].color).toBe('#00FF00');
  });

  it('creates a tag', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: { uuid: 'tag-new', name: 'Important', color: '#FF5733', created_at: '2026-01-01T00:00:00Z' },
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }, 201));

    const tag = await nashra.tags.create({ name: 'Important', color: '#FF5733' });

    expect(tag.name).toBe('Important');
    expect(tag.color).toBe('#FF5733');
  });

  it('updates a tag', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: { uuid: 'tag-1', name: 'Super VIP', color: '#0000FF', created_at: '2026-01-01T00:00:00Z' },
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }));

    const tag = await nashra.tags.update('tag-1', { name: 'Super VIP' });

    expect(tag.name).toBe('Super VIP');
  });

  it('deletes a tag', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: [],
      message: 'Tag deleted.',
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }));

    const result = await nashra.tags.delete('tag-1');

    expect(result.message).toBe('Tag deleted.');
  });
});
