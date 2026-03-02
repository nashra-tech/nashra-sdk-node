import { NashraError } from './nashra-error';

export class AuthenticationError extends NashraError {
  constructor(message = 'Unauthenticated. Use a valid API token.', response?: unknown) {
    super(message, 401, 'INVALID_TOKEN', response);
    this.name = 'AuthenticationError';
  }
}
