export interface ApiMeta {
  version: string;
  timestamp: string;
}

export interface PaginationMeta extends ApiMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta: ApiMeta;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  };
  meta: ApiMeta;
}

export interface DeleteResponse {
  data: [];
  message: string;
  meta: ApiMeta;
}
