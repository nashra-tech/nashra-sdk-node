export class Page<T> {
  constructor(
    public readonly data: T[],
    public readonly currentPage: number,
    public readonly lastPage: number,
    public readonly perPage: number,
    public readonly total: number,
  ) {}

  get hasMorePages(): boolean {
    return this.currentPage < this.lastPage;
  }
}
