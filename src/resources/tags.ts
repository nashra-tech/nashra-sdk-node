import type { NashraClient } from '../client';
import { Page } from '../pagination/page';
import { Paginator } from '../pagination/paginator';
import type { ApiResponse, DeleteResponse, PaginatedApiResponse } from '../types/api-response';
import type { CreateTagParams, ListTagsParams, Tag, UpdateTagParams } from '../types/tag';
import { BaseResource } from './base-resource';

export class TagsResource extends BaseResource {
  constructor(client: NashraClient) {
    super(client);
  }

  list(params: ListTagsParams = {}): Paginator<Tag> {
    return new Paginator(async (page: number) => {
      const response = await this.client.get<PaginatedApiResponse<Tag>>('/tags', {
        ...params,
        page,
      });

      return new Page<Tag>(
        response.data,
        response.meta.current_page,
        response.meta.last_page,
        response.meta.per_page,
        response.meta.total,
      );
    });
  }

  async create(data: CreateTagParams): Promise<Tag> {
    const response = await this.client.post<ApiResponse<Tag>>('/tags', data);
    return response.data;
  }

  async update(uuid: string, data: UpdateTagParams): Promise<Tag> {
    const response = await this.client.patch<ApiResponse<Tag>>(`/tags/${uuid}`, data);
    return response.data;
  }

  async delete(uuid: string): Promise<DeleteResponse> {
    return this.client.delete<DeleteResponse>(`/tags/${uuid}`);
  }
}
