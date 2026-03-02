// Main entry
export { Nashra } from './nashra';

// Client
export { NashraClient } from './client';

// Config
export type { NashraConfig } from './config';
export { DEFAULT_BASE_URL, DEFAULT_MAX_RETRIES, DEFAULT_TIMEOUT } from './config';

// Resources
export { SubscribersResource } from './resources/subscribers';
export { TagsResource } from './resources/tags';
export { CustomFieldsResource } from './resources/custom-fields';
export { SegmentsResource } from './resources/segments';

// Types
export type { Subscriber, CreateSubscriberParams, UpdateSubscriberParams, ListSubscribersParams } from './types/subscriber';
export type { Tag, CreateTagParams, UpdateTagParams, ListTagsParams } from './types/tag';
export type { CustomField, CreateCustomFieldParams, UpdateCustomFieldParams, ListCustomFieldsParams } from './types/custom-field';
export type { Segment } from './types/segment';
export type { ApiResponse, PaginatedApiResponse, ApiErrorResponse, DeleteResponse, ApiMeta, PaginationMeta } from './types/api-response';

// Pagination
export { Page } from './pagination/page';
export { Paginator } from './pagination/paginator';

// Errors
export {
  NashraError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ApiError,
} from './errors';
