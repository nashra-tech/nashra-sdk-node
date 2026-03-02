export class NashraError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly response?: unknown,
  ) {
    super(message);
    this.name = 'NashraError';
  }
}
