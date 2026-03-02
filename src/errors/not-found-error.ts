import { NashraError } from './nashra-error';

export class NotFoundError extends NashraError {
  constructor(message = 'Resource not found', response?: unknown) {
    super(message, 404, 'NOT_FOUND', response);
    this.name = 'NotFoundError';
  }
}
