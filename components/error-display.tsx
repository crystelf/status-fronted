/**
 * Error Display Component
 * Shows user-friendly error messages with retry option
 */

'use client';

import { AlertCircle, RefreshCw, WifiOff, Clock, ServerCrash } from 'lucide-react';
import { UserFriendlyError, ErrorType } from '@/lib/error-handler';

interface ErrorDisplayProps {
  error: UserFriendlyError;
  onRetry?: () => void;
  className?: string;
}

/**
 * Get icon for error type
 */
function getErrorIcon(type: ErrorType) {
  switch (type) {
    case ErrorType.NETWORK:
      return <WifiOff className="h-8 w-8" />;
    case ErrorType.TIMEOUT:
      return <Clock className="h-8 w-8" />;
    case ErrorType.SERVER:
      return <ServerCrash className="h-8 w-8" />;
    default:
      return <AlertCircle className="h-8 w-8" />;
  }
}

/**
 * Error Display Component
 */
export function ErrorDisplay({ error, onRetry, className = '' }: ErrorDisplayProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 ${className}`}
    >
      <div className="text-red-600 dark:text-red-400 mb-4">{getErrorIcon(error.type)}</div>

      <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">{error.title}</h3>

      <p className="text-sm text-red-700 dark:text-red-300 text-center mb-4 max-w-md">
        {error.message}
      </p>

      {error.canRetry && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-md transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Inline Error Display (smaller version)
 */
export function InlineErrorDisplay({ error, onRetry, className = '' }: ErrorDisplayProps) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 ${className}`}
    >
      <div className="text-red-600 dark:text-red-400 flex-shrink-0">
        <AlertCircle className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-900 dark:text-red-100">{error.title}</p>
        <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error.message}</p>
      </div>

      {error.canRetry && onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          title="Retry"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

