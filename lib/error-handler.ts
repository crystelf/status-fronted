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
        title: 'Network Connection Failed',
        message: 'Unable to connect to the server. Please check your network connection or server status',
        canRetry: true,
        originalError: error,
      };
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT,
        title: 'Request Timeout',
        message: 'Server response time is too long. Please try again later',
        canRetry: true,
        originalError: error,
      };
    }

    // 404 Not Found
    if (error.statusCode === 404) {
      return {
        type: ErrorType.NOT_FOUND,
        title: 'Resource Not Found',
        message: 'The requested client or resource does not exist',
        canRetry: false,
        originalError: error,
      };
    }

    // 400 Bad Request / Validation errors
    if (error.statusCode === 400) {
      return {
        type: ErrorType.VALIDATION,
        title: 'Request Parameter Error',
        message: error.message || 'Request parameters are incorrect. Please check your input',
        canRetry: false,
        originalError: error,
      };
    }

    // 500 Server errors
    if (error.statusCode && error.statusCode >= 500) {
      return {
        type: ErrorType.SERVER,
        title: 'Server Error',
        message: 'Server encountered an error. Please try again later',
        canRetry: true,
        originalError: error,
      };
    }

    // Other API errors
    return {
      type: ErrorType.UNKNOWN,
      title: 'Request Failed',
      message: error.message || 'An unknown error occurred',
      canRetry: true,
      originalError: error,
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      title: 'Error Occurred',
      message: error.message || 'An unknown error occurred',
      canRetry: false,
      originalError: error,
    };
  }

  // Handle unknown error types
  return {
    type: ErrorType.UNKNOWN,
    title: 'Error Occurred',
    message: 'An unknown error occurred, please try again later',
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







