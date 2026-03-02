import type { NashraClient } from '../client';
import { Page } from '../pagination/page';
import { Paginator } from '../pagination/paginator';
import type { ApiResponse, DeleteResponse, PaginatedApiResponse } from '../types/api-response';
import type {
  CreateCustomFieldParams,
  CustomField,
  ListCustomFieldsParams,
  UpdateCustomFieldParams,
} from '../types/custom-field';
import { BaseResource } from './base-resource';

export class CustomFieldsResource extends BaseResource {
  constructor(client: NashraClient) {
    super(client);
  }

  list(params: ListCustomFieldsParams = {}): Paginator<CustomField> {
    return new Paginator(async (page: number) => {
      const response = await this.client.get<PaginatedApiResponse<CustomField>>('/fields', {
        ...params,
        page,
      });

      return new Page<CustomField>(
        response.data,
        response.meta.current_page,
        response.meta.last_page,
        response.meta.per_page,
        response.meta.total,
      );
    });
  }

  async create(data: CreateCustomFieldParams): Promise<CustomField> {
    const response = await this.client.post<ApiResponse<CustomField>>('/fields', data);
    return response.data;
  }

  async update(uuid: string, data: UpdateCustomFieldParams): Promise<CustomField> {
    const response = await this.client.patch<ApiResponse<CustomField>>(`/fields/${uuid}`, data);
    return response.data;
  }

  async delete(uuid: string): Promise<DeleteResponse> {
    return this.client.delete<DeleteResponse>(`/fields/${uuid}`);
  }
}
