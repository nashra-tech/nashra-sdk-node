import { NashraError } from './nashra-error';

export class ApiError extends NashraError {
  constructor(message = 'An unexpected API error occurred.', statusCode = 500, response?: unknown) {
    super(message, statusCode, 'SERVER_ERROR', response);
    this.name = 'ApiError';
  }
}
