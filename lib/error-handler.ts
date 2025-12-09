/**
 * Error Handler for API Client
 * Provides user-friendly error messages and error display utilities
 * Requirements: 7.4
 */

import { ApiError } from './api-client';

/**
 * Error types for categorization
 */
export enum ErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  NOT_FOUND = 'not_found',
  VALIDATION = 'validation',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

/**
 * User-friendly error message
 */
export interface UserFriendlyError {
  type: ErrorType;
  title: string;
  message: string;
  canRetry: boolean;
  originalError?: unknown;
}

/**
 * Convert API errors to user-friendly messages
 */
export function handleApiError(error: unknown): UserFriendlyError {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    // Network errors
    if (error.message.includes('Network error') || error.message.includes('Unable to connect')) {
      return {
        type: ErrorType.NETWORK,
        title: '网络连接失败',
        message: '无法连接到服务器，请检查网络连接或服务器状态',
        canRetry: true,
        originalError: error,
      };
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT,
        title: '请求超时',
        message: '服务器响应时间过长，请稍后重试',
        canRetry: true,
        originalError: error,
      };
    }

    // 404 Not Found
    if (error.statusCode === 404) {
      return {
        type: ErrorType.NOT_FOUND,
        title: '资源不存在',
        message: '请求的客户端或资源不存在',
        canRetry: false,
        originalError: error,
      };
    }

    // 400 Bad Request / Validation errors
    if (error.statusCode === 400) {
      return {
        type: ErrorType.VALIDATION,
        title: '请求参数错误',
        message: error.message || '请求参数不正确，请检查输入',
        canRetry: false,
        originalError: error,
      };
    }

    // 500 Server errors
    if (error.statusCode && error.statusCode >= 500) {
      return {
        type: ErrorType.SERVER,
        title: '服务器错误',
        message: '服务器遇到错误，请稍后重试',
        canRetry: true,
        originalError: error,
      };
    }

    // Other API errors
    return {
      type: ErrorType.UNKNOWN,
      title: '请求失败',
      message: error.message || '发生未知错误',
      canRetry: true,
      originalError: error,
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      title: '发生错误',
      message: error.message || '发生未知错误',
      canRetry: false,
      originalError: error,
    };
  }

  // Handle unknown error types
  return {
    type: ErrorType.UNKNOWN,
    title: '发生错误',
    message: '发生未知错误，请稍后重试',
    canRetry: false,
    originalError: error,
  };
}

/**
 * Log error to console (can be extended to send to logging service)
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';
  
  console.error(`${timestamp} ${contextStr} Error:`, error);
  
  if (error instanceof ApiError && error.originalError) {
    console.error('Original error:', error.originalError);
  }
}

/**
 * Format error for display
 */
export function formatErrorMessage(error: UserFriendlyError): string {
  return `${error.title}: ${error.message}`;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const userError = handleApiError(error);
  return userError.canRetry;
}
