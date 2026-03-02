import { NashraError } from './nashra-error';

export class ValidationError extends NashraError {
  public readonly details: Record<string, string[]>;

  constructor(
    message = 'The given data was invalid.',
    details: Record<string, string[]> = {},
    response?: unknown,
  ) {
    super(message, 422, 'VALIDATION_ERROR', response);
    this.name = 'ValidationError';
    this.details = details;
  }
}
