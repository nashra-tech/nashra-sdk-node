import { Page } from './page';

export class Paginator<T> implements AsyncIterable<T> {
  constructor(private readonly fetchPage: (page: number) => Promise<Page<T>>) {}

  async getPage(page = 1): Promise<Page<T>> {
    return this.fetchPage(page);
  }

  async toArray(): Promise<T[]> {
    const items: T[] = [];
    for await (const item of this) {
      items.push(item);
    }
    return items;
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
    let page = 1;
    while (true) {
      const result = await this.fetchPage(page);
      for (const item of result.data) {
        yield item;
      }
      if (!result.hasMorePages) {
        break;
      }
      page++;
    }
  }
}
