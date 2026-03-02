import type { NashraClient } from '../client';
import type { ApiResponse } from '../types/api-response';
import type { Segment } from '../types/segment';
import { BaseResource } from './base-resource';

interface SegmentListResponse {
  data: Segment[];
  meta: { version: string; timestamp: string };
}

export class SegmentsResource extends BaseResource {
  constructor(client: NashraClient) {
    super(client);
  }

  async list(): Promise<Segment[]> {
    const response = await this.client.get<SegmentListResponse>('/segments');
    return response.data;
  }

  async find(uuid: string): Promise<Segment> {
    const response = await this.client.get<ApiResponse<Segment>>(`/segments/${uuid}`);
    return response.data;
  }
}
