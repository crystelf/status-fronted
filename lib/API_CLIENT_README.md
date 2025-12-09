# API Client Documentation

## Overview

The API client provides a robust interface for communicating with the System Monitor backend server. It includes automatic retry logic, timeout handling, and comprehensive error management.

## Features

- ✅ **Automatic Retry**: Failed requests are automatically retried with exponential backoff
- ✅ **Timeout Handling**: Requests timeout after 5 seconds by default
- ✅ **Error Handling**: User-friendly error messages with categorization
- ✅ **Type Safety**: Full TypeScript support with comprehensive type definitions
- ✅ **React Hooks**: Easy-to-use hooks for React components
- ✅ **Error Display**: Pre-built components for showing errors to users

## Installation

The API client is already included in the project. No additional installation required.

## Configuration

Set the API base URL using environment variables:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:7788
```

## Usage

### Using React Hooks (Recommended)

#### 1. Fetch All Clients

```tsx
import { useAllClients } from '@/lib/use-api';
import { ErrorDisplay } from '@/components/error-display';

function ClientList() {
  const { data: clients, loading, error, fetchClients, retry } = useAllClients();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  if (loading) return <div>Loading...</div>;
  if (error) return <ErrorDisplay error={error} onRetry={retry} />;

  return (
    <div>
      {clients?.map(client => (
        <div key={client.clientId}>{client.clientName}</div>
      ))}
    </div>
  );
}
```

#### 2. Fetch Client Detail

```tsx
import { useClientDetail } from '@/lib/use-api';

function ClientDetail({ clientId }: { clientId: string }) {
  const { data: detail, loading, error, retry } = useClientDetail();

  useEffect(() => {
    fetchDetail(clientId);
  }, [clientId, fetchDetail]);

  // ... render logic
}
```

#### 3. Fetch Client History

```tsx
import { useClientHistory } from '@/lib/use-api';

function ClientHistory({ clientId }: { clientId: string }) {
  const { data: history, loading, error, fetchHistory, retry } = useClientHistory();

  useEffect(() => {
    const endTime = Date.now();
    const startTime = endTime - 24 * 60 * 60 * 1000; // Last 24 hours
    
    fetchHistory(clientId, { startTime, endTime });
  }, [clientId, fetchHistory]);

  // ... render logic
}
```

### Direct API Client Usage

```tsx
import { apiClient } from '@/lib/api-client';

async function fetchData() {
  try {
    // Fetch all clients
    const clients = await apiClient.fetchAllClients();
    
    // Fetch specific client
    const detail = await apiClient.fetchClientDetail('client-id');
    
    // Fetch history
    const history = await apiClient.fetchClientHistory('client-id', {
      startTime: Date.now() - 3600000,
      endTime: Date.now()
    });
  } catch (error) {
    console.error('API Error:', error);
  }
}
```

### Custom API Client Instance

```tsx
import { createApiClient } from '@/lib/api-client';

const customClient = createApiClient('https://custom-api.example.com');
const clients = await customClient.fetchAllClients();
```

## Error Handling

### Error Types

The API client categorizes errors into the following types:

- `NETWORK`: Network connection failures
- `TIMEOUT`: Request timeout
- `NOT_FOUND`: Resource not found (404)
- `VALIDATION`: Invalid request parameters (400)
- `SERVER`: Server errors (5xx)
- `UNKNOWN`: Other errors

### Error Display Components

#### Full Error Display

```tsx
import { ErrorDisplay } from '@/components/error-display';

<ErrorDisplay 
  error={error} 
  onRetry={retry} 
  className="my-4"
/>
```

#### Inline Error Display

```tsx
import { InlineErrorDisplay } from '@/components/error-display';

<InlineErrorDisplay 
  error={error} 
  onRetry={retry}
/>
```

### Manual Error Handling

```tsx
import { handleApiError, logError } from '@/lib/error-handler';

try {
  await apiClient.fetchAllClients();
} catch (error) {
  const userError = handleApiError(error);
  logError(error, 'MyComponent');
  
  console.log(userError.title);    // User-friendly title
  console.log(userError.message);  // User-friendly message
  console.log(userError.canRetry); // Whether retry is possible
}
```

## API Reference

### ApiClient Class

#### Methods

##### `fetchAllClients(): Promise<ClientSummary[]>`

Fetches all registered clients.

**Returns**: Array of client summaries

**Requirements**: 4.1

##### `fetchClientDetail(clientId: string): Promise<ClientDetail>`

Fetches detailed information for a specific client.

**Parameters**:
- `clientId`: The unique identifier of the client

**Returns**: Detailed client information

**Requirements**: 4.2

##### `fetchClientHistory(clientId: string, query?: HistoryQuery): Promise<DynamicSystemStatus[]>`

Fetches historical status data for a client.

**Parameters**:
- `clientId`: The unique identifier of the client
- `query`: Optional query parameters
  - `startTime`: Start timestamp (milliseconds)
  - `endTime`: End timestamp (milliseconds)

**Returns**: Array of historical status records

**Requirements**: 4.3

### Type Definitions

#### ClientSummary

```typescript
interface ClientSummary {
  clientId: string;
  clientName: string;
  clientTags: string[];
  clientPurpose: string;
  hostname: string;
  platform: string;
  status: 'online' | 'offline';
  lastUpdate: number;
}
```

#### ClientDetail

```typescript
interface ClientDetail extends ClientSummary {
  staticInfo: StaticSystemInfo;
  currentStatus: DynamicSystemStatus;
}
```

#### DynamicSystemStatus

```typescript
interface DynamicSystemStatus {
  cpuUsage: number;
  cpuFrequency: number;
  memoryUsage: number;
  swapUsage: number;
  diskUsage: number;
  networkUpload: number;
  networkDownload: number;
  timestamp: number;
}
```

## Configuration Options

### ApiClient Constructor

```typescript
new ApiClient({
  baseUrl: string;        // API base URL
  timeout?: number;       // Request timeout in ms (default: 5000)
  maxRetries?: number;    // Max retry attempts (default: 3)
  retryDelay?: number;    // Initial retry delay in ms (default: 1000)
})
```

## Best Practices

1. **Use React Hooks**: Prefer `useAllClients`, `useClientDetail`, and `useClientHistory` hooks in React components
2. **Handle Errors**: Always display errors to users using the `ErrorDisplay` component
3. **Provide Retry**: Allow users to retry failed requests when `error.canRetry` is true
4. **Log Errors**: Use `logError()` to log errors for debugging
5. **Set Environment Variables**: Configure `NEXT_PUBLIC_API_URL` for different environments

## Troubleshooting

### Network Errors

If you see "Network error: Unable to connect to server":
- Check if the backend server is running
- Verify the API URL is correct
- Check network connectivity

### Timeout Errors

If requests timeout frequently:
- Increase the timeout value when creating the API client
- Check server performance
- Verify network latency

### CORS Errors

If you see CORS errors in the browser console:
- Ensure the backend server has CORS enabled
- Verify the API URL matches the server configuration
