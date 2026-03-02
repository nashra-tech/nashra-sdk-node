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

describe('CustomFieldsResource', () => {
  const nashra = new Nashra('test-key', { maxRetries: 0 });

  it('lists custom fields', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: [
        { uuid: 'field-1', field_name: 'Company', data_name: 'company', type: 'text', is_required: false },
        { uuid: 'field-2', field_name: 'Age', data_name: 'age', type: 'number', is_required: true },
      ],
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z', current_page: 1, last_page: 1, per_page: 15, total: 2, from: 1, to: 2 },
    }));

    const page = await nashra.fields.list().getPage();

    expect(page.data).toHaveLength(2);
    expect(page.data[0].field_name).toBe('Company');
    expect(page.data[0].type).toBe('text');
    expect(page.data[1].is_required).toBe(true);
  });

  it('creates a custom field', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: { uuid: 'field-new', field_name: 'Website', data_name: 'website', type: 'text', is_required: false },
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }, 201));

    const field = await nashra.fields.create({ field_name: 'Website', data_name: 'website', type: 'text' });

    expect(field.field_name).toBe('Website');
    expect(field.data_name).toBe('website');
  });

  it('updates a custom field', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: { uuid: 'field-1', field_name: 'Company Name', data_name: 'company', type: 'text', is_required: true },
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }));

    const field = await nashra.fields.update('field-1', { field_name: 'Company Name', is_required: true });

    expect(field.field_name).toBe('Company Name');
    expect(field.is_required).toBe(true);
  });

  it('deletes a custom field', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({
      data: [],
      message: 'Custom field deleted.',
      meta: { version: 'v1', timestamp: '2026-01-01T00:00:00Z' },
    }));

    const result = await nashra.fields.delete('field-1');

    expect(result.message).toBe('Custom field deleted.');
  });
});
