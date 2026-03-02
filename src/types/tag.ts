export interface Tag {
  uuid: string;
  name: string;
  color: string | null;
  created_at: string | null;
}

export interface CreateTagParams {
  name: string;
  color?: string;
}

export interface UpdateTagParams {
  name?: string;
  color?: string;
}

export interface ListTagsParams {
  per_page?: number;
  page?: number;
}
