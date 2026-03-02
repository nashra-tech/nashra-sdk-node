import { NashraClient } from './client';
import type { NashraConfig } from './config';
import { CustomFieldsResource } from './resources/custom-fields';
import { SegmentsResource } from './resources/segments';
import { SubscribersResource } from './resources/subscribers';
import { TagsResource } from './resources/tags';

export class Nashra {
  readonly subscribers: SubscribersResource;
  readonly tags: TagsResource;
  readonly fields: CustomFieldsResource;
  readonly segments: SegmentsResource;

  constructor(apiKey: string, config?: Partial<Omit<NashraConfig, 'apiKey'>>) {
    const client = new NashraClient({ apiKey, ...config });
    this.subscribers = new SubscribersResource(client);
    this.tags = new TagsResource(client);
    this.fields = new CustomFieldsResource(client);
    this.segments = new SegmentsResource(client);
  }
}
