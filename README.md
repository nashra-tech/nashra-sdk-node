# Nashra Node.js SDK

Official Node.js SDK for the [Nashra](https://nashra.ai) API. Zero runtime dependencies, built with TypeScript.

## Requirements

- Node.js 18+

## Installation

```bash
npm install nashra
```

## Quick Start

```typescript
import { Nashra } from 'nashra';

const nashra = new Nashra('your-api-key');

// List subscribers
const page = await nashra.subscribers.list({ search: 'john' }).getPage();
console.log(page.data); // Subscriber[]

// Create a subscriber
const subscriber = await nashra.subscribers.create({
  email: 'john@example.com',
  first_name: 'John',
  tags: ['tag-uuid-1'],
});
```

## Configuration

```typescript
const nashra = new Nashra('your-api-key', {
  baseUrl: 'https://app.nashra.ai/api/v1', // default
  timeout: 30000,  // ms, default
  maxRetries: 3,   // default, retries on 429/5xx
});
```

## Resources

### Subscribers

```typescript
// List (paginated)
const page = await nashra.subscribers.list({ per_page: 50, search: 'john' }).getPage();

// Create
const subscriber = await nashra.subscribers.create({
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
  tags: ['tag-uuid'],
  extra_attributes: { company: 'Acme' },
  notes: 'VIP customer',
});

// Find
const subscriber = await nashra.subscribers.find('uuid');

// Update
const updated = await nashra.subscribers.update('uuid', { first_name: 'Jane' });

// Delete
await nashra.subscribers.delete('uuid');
```

### Tags

```typescript
const page = await nashra.tags.list().getPage();
const tag = await nashra.tags.create({ name: 'VIP', color: '#FF0000' });
const updated = await nashra.tags.update('uuid', { name: 'Premium' });
await nashra.tags.delete('uuid');
```

### Custom Fields

```typescript
const page = await nashra.fields.list().getPage();
const field = await nashra.fields.create({
  field_name: 'Company',
  data_name: 'company',
  type: 'text',
  is_required: false,
});
const updated = await nashra.fields.update('uuid', { is_required: true });
await nashra.fields.delete('uuid');
```

### Segments (read-only)

```typescript
const segments = await nashra.segments.list();
const segment = await nashra.segments.find('uuid');
```

## Pagination

Paginated resources return a `Paginator` that implements `AsyncIterable`:

```typescript
// Auto-paginate through all pages
for await (const subscriber of nashra.subscribers.list()) {
  console.log(subscriber.email);
}

// Get a specific page
const page = await nashra.subscribers.list({ per_page: 50 }).getPage(2);
page.data;          // Subscriber[]
page.total;         // number
page.currentPage;   // number
page.lastPage;      // number
page.hasMorePages;  // boolean

// Collect all items
const all = await nashra.subscribers.list().toArray();
```

## Error Handling

```typescript
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ApiError,
} from 'nashra';

try {
  await nashra.subscribers.create({ email: 'invalid' });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.details); // { email: ['The email must be a valid email address.'] }
  } else if (error instanceof AuthenticationError) {
    // Invalid API key (401)
  } else if (error instanceof AuthorizationError) {
    // No newsletter configured (403)
  } else if (error instanceof NotFoundError) {
    // Resource not found (404)
  } else if (error instanceof RateLimitError) {
    console.log(error.retryAfter); // seconds until retry
  } else if (error instanceof ApiError) {
    // Server error (5xx)
  }
}
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  Subscriber,
  CreateSubscriberParams,
  Tag,
  CustomField,
  Segment,
  NashraConfig,
} from 'nashra';
```

## License

MIT
