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

describe('SegmentsResource', () => {
  const nashra = new Nashra('test-key', { maxRetries: 0 });

  it('lists all segments', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: [
        { uuid: 'seg-1', name: 'Active Users', subscribers_count: 150, stored_conditions: [{ field: 'status', operator: '=', value: 'active' }], created_at: '2026-01-01T00:00:00Z' },
        { uuid: 'seg-2', name: 'New Users', subscribers_count: 50, stored_conditions: [], created_at: '2026-01-01T00:00:00Z' },
      ],
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }));

    const segments = await nashra.segments.list();

    expect(segments).toHaveLength(2);
    expect(segments[0].name).toBe('Active Users');
    expect(segments[0].subscribers_count).toBe(150);
    expect(segments[1].name).toBe('New Users');
  });

  it('finds a segment by uuid', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: {
        uuid: 'seg-1',
        name: 'Active Users',
        subscribers_count: 150,
        stored_conditions: [{ field: 'status', operator: '=', value: 'active' }],
        created_at: '2026-01-01T00:00:00Z',
      },
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }));

    const segment = await nashra.segments.find('seg-1');

    expect(segment.uuid).toBe('seg-1');
    expect(segment.name).toBe('Active Users');
    expect(segment.stored_conditions).toBeInstanceOf(Array);
  });
});
