import { NashraError } from './nashra-error';

export class RateLimitError extends NashraError {
  public readonly retryAfter: number;

  constructor(retryAfter = 60, response?: unknown) {
    super(`Rate limit exceeded. Retry after ${retryAfter} seconds.`, 429, 'RATE_LIMITED', response);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}
