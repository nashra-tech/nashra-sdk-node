import type { Tag } from './tag';

export interface Subscriber {
  uuid: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: string | null;
  tags: Tag[];
  extra_attributes: Record<string, unknown> | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateSubscriberParams {
  email: string;
  first_name?: string;
  last_name?: string;
  tags?: string[];
  extra_attributes?: Record<string, unknown>;
  notes?: string;
}

export interface UpdateSubscriberParams {
  email?: string;
  first_name?: string;
  last_name?: string;
  tags?: string[];
  extra_attributes?: Record<string, unknown>;
  notes?: string;
}

export interface ListSubscribersParams {
  per_page?: number;
  page?: number;
  search?: string;
  status?: string;
}
