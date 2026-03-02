import type { NashraClient } from '../client';

export abstract class BaseResource {
  constructor(protected readonly client: NashraClient) {}
}
