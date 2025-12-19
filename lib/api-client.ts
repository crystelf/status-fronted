/**
 * API Client for System Monitor Frontend
 * Handles communication with the backend server
 */

// Type definitions based on design document
export interface DiskInfo {
  device: string;
  size: number;
  type: string;
  interfaceType?: string;
}

export interface DiskUsage {
  device: string;
  size: number;
  used: number;
  available: number;
  usagePercent: number;
  mountpoint?: string;
}

export interface StaticSystemInfo {
  cpuModel: string;
  cpuCores: number;
  cpuArch: string;
  systemVersion: string;
  systemModel: string;
  totalMemory: number;
  totalSwap: number;
  totalDisk: number;
  disks: DiskInfo[];
  location: string;
  timezone: string;
}

export interface DynamicSystemStatus {
  cpuUsage: number;
  cpuFrequency: number;
  memoryUsage: number;
  swapUsage: number;
  diskUsage: number;
  diskUsages: DiskUsage[];
  networkUpload: number;
  networkDownload: number;
  timestamp: number;
}

export interface ClientSummary {
  clientId: string;
  clientName: string;
  clientTags: string[];
  clientPurpose: string;
  hostname: string;
  platform: string;
  status: 'online' | 'offline';
  lastUpdate: number;
  createdAt: number;
  lastOnlineAt: number | null;
}

export interface ClientDetail extends ClientSummary {
  staticInfo: StaticSystemInfo;
  currentStatus: DynamicSystemStatus;
}

export interface HistoryQuery {
  startTime?: number;
  endTime?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Client Configuration
 */
interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * API Client Class
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost:7788';
    this.timeout = config.timeout || 5000;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  /**
   * Generic fetch wrapper with timeout and retry logic
   */
  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          // If not JSON, use the text as is
          errorMessage = errorText || errorMessage;
        }

        throw new ApiError(errorMessage, response.status);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort/timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        if (retryCount < this.maxRetries) {
          await this.delay(this.retryDelay * Math.pow(2, retryCount));
          return this.fetchWithRetry<T>(url, options, retryCount + 1);
        }
        throw new ApiError('Request timeout', undefined, error);
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (retryCount < this.maxRetries) {
          await this.delay(this.retryDelay * Math.pow(2, retryCount));
          return this.fetchWithRetry<T>(url, options, retryCount + 1);
        }
        throw new ApiError('Network error: Unable to connect to server', undefined, error);
      }

      // Re-throw ApiError as is
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        undefined,
        error
      );
    }
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fetch all clients
   * Requirements: 4.1
   */
  async fetchAllClients(): Promise<ClientSummary[]> {
    const url = `${this.baseUrl}/api/clients`;
    return this.fetchWithRetry<ClientSummary[]>(url);
  }

  /**
   * Fetch client detail by ID
   * Requirements: 4.2
   */
  async fetchClientDetail(clientId: string): Promise<ClientDetail> {
    if (!clientId || clientId.trim() === '') {
      throw new ApiError('Client ID is required');
    }

    const url = `${this.baseUrl}/api/clients/${encodeURIComponent(clientId)}`;
    return this.fetchWithRetry<ClientDetail>(url);
  }

  /**
   * Fetch client history
   * Requirements: 4.3
   */
  async fetchClientHistory(
    clientId: string,
    query?: HistoryQuery
  ): Promise<DynamicSystemStatus[]> {
    if (!clientId || clientId.trim() === '') {
      throw new ApiError('Client ID is required');
    }

    const params = new URLSearchParams();
    if (query?.startTime) {
      params.append('startTime', query.startTime.toString());
    }
    if (query?.endTime) {
      params.append('endTime', query.endTime.toString());
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/api/clients/${encodeURIComponent(clientId)}/history${
      queryString ? `?${queryString}` : ''
    }`;

    return this.fetchWithRetry<DynamicSystemStatus[]>(url);
  }
}

/**
 * Create a default API client instance
 */
export function createApiClient(baseUrl?: string): ApiClient {
  return new ApiClient({
    baseUrl: baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7788',
    timeout: 5000,
    maxRetries: 3,
    retryDelay: 1000,
  });
}

/**
 * Default API client instance
 */
export const apiClient = createApiClient();
