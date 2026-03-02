import { NashraError } from './nashra-error';

export class AuthorizationError extends NashraError {
  constructor(message = 'No newsletter configured for this account.', response?: unknown) {
    super(message, 403, 'MISSING_NEWSLETTER', response);
    this.name = 'AuthorizationError';
  }
}
