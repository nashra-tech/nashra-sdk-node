import { describe, expect, it } from 'vitest';
import { Page } from '../../src/pagination/page';
import { Paginator } from '../../src/pagination/paginator';

describe('Paginator', () => {
  it('gets a single page', async () => {
    const paginator = new Paginator(async (page: number) => {
      return new Page(['a', 'b', 'c'], page, 1, 3, 3);
    });

    const page = await paginator.getPage(1);

    expect(page.data).toEqual(['a', 'b', 'c']);
    expect(page.total).toBe(3);
    expect(page.hasMorePages).toBe(false);
  });

  it('async iterates through all pages', async () => {
    const paginator = new Paginator(async (page: number) => {
      if (page === 1) return new Page(['a', 'b'], 1, 3, 2, 5);
      if (page === 2) return new Page(['c', 'd'], 2, 3, 2, 5);
      return new Page(['e'], 3, 3, 2, 5);
    });

    const items: string[] = [];
    for await (const item of paginator) {
      items.push(item);
    }

    expect(items).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('collects all items with toArray', async () => {
    const paginator = new Paginator(async (page: number) => {
      if (page === 1) return new Page([1, 2], 1, 2, 2, 4);
      return new Page([3, 4], 2, 2, 2, 4);
    });

    const items = await paginator.toArray();

    expect(items).toEqual([1, 2, 3, 4]);
  });

  it('handles single page correctly', async () => {
    const paginator = new Paginator(async () => {
      return new Page(['only'], 1, 1, 10, 1);
    });

    const items = await paginator.toArray();

    expect(items).toEqual(['only']);
  });

  it('handles empty results', async () => {
    const paginator = new Paginator(async () => {
      return new Page([], 1, 1, 10, 0);
    });

    const items = await paginator.toArray();

    expect(items).toEqual([]);
  });
});

describe('Page', () => {
  it('reports hasMorePages correctly', () => {
    const page1 = new Page([], 1, 3, 10, 25);
    expect(page1.hasMorePages).toBe(true);

    const page3 = new Page([], 3, 3, 10, 25);
    expect(page3.hasMorePages).toBe(false);
  });
});
