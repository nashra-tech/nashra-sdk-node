import type { NashraClient } from '../client';
import { Page } from '../pagination/page';
import { Paginator } from '../pagination/paginator';
import type { ApiResponse, DeleteResponse, PaginatedApiResponse } from '../types/api-response';
import type {
  CreateSubscriberParams,
  ListSubscribersParams,
  Subscriber,
  UpdateSubscriberParams,
} from '../types/subscriber';
import { BaseResource } from './base-resource';

export class SubscribersResource extends BaseResource {
  constructor(client: NashraClient) {
    super(client);
  }

  list(params: ListSubscribersParams = {}): Paginator<Subscriber> {
    return new Paginator(async (page: number) => {
      const response = await this.client.get<PaginatedApiResponse<Subscriber>>('/subscribers', {
        ...params,
        page,
      });

      return new Page<Subscriber>(
        response.data,
        response.meta.current_page,
        response.meta.last_page,
        response.meta.per_page,
        response.meta.total,
      );
    });
  }

  async create(data: CreateSubscriberParams): Promise<Subscriber> {
    const response = await this.client.post<ApiResponse<Subscriber>>('/subscribers', data);
    return response.data;
  }

  async find(uuid: string): Promise<Subscriber> {
    const response = await this.client.get<ApiResponse<Subscriber>>(`/subscribers/${uuid}`);
    return response.data;
  }

  async update(uuid: string, data: UpdateSubscriberParams): Promise<Subscriber> {
    const response = await this.client.patch<ApiResponse<Subscriber>>(`/subscribers/${uuid}`, data);
    return response.data;
  }

  async delete(uuid: string): Promise<DeleteResponse> {
    return this.client.delete<DeleteResponse>(`/subscribers/${uuid}`);
  }
}
