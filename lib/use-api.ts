/**
 * React hooks for API client with error handling
 */

'use client';

import { useState, useCallback } from 'react';
import {
  apiClient,
  ClientSummary,
  ClientDetail,
  DynamicSystemStatus,
  HistoryQuery,
} from './api-client';
import { handleApiError, logError, UserFriendlyError } from './error-handler';

/**
 * API state interface
 */
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: UserFriendlyError | null;
}

/**
 * Hook for fetching all clients
 */
export function useAllClients() {
  const [state, setState] = useState<ApiState<ClientSummary[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchClients = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const clients = await apiClient.fetchAllClients();
      setState({ data: clients, loading: false, error: null });
      return clients;
    } catch (error) {
      const userError = handleApiError(error);
      logError(error, 'useAllClients');
      setState({ data: null, loading: false, error: userError });
      throw error;
    }
  }, []);

  const retry = useCallback(() => {
    return fetchClients();
  }, [fetchClients]);

  return {
    ...state,
    fetchClients,
    retry,
  };
}

/**
 * Hook for fetching client detail
 */
export function useClientDetail(clientId?: string) {
  const [state, setState] = useState<ApiState<ClientDetail>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchDetail = useCallback(
    async (id?: string) => {
      const targetId = id || clientId;

      if (!targetId) {
        const error = new Error('Client ID is required');
        const userError = handleApiError(error);
        setState({ data: null, loading: false, error: userError });
        return;
      }

      setState({ data: null, loading: true, error: null });

      try {
        const detail = await apiClient.fetchClientDetail(targetId);
        setState({ data: detail, loading: false, error: null });
        return detail;
      } catch (error) {
        const userError = handleApiError(error);
        logError(error, 'useClientDetail');
        setState({ data: null, loading: false, error: userError });
        throw error;
      }
    },
    [clientId]
  );

  const retry = useCallback(() => {
    return fetchDetail();
  }, [fetchDetail]);

  return {
    ...state,
    fetchDetail,
    retry,
  };
}

/**
 * Hook for fetching client history
 */
export function useClientHistory(clientId?: string) {
  const [state, setState] = useState<ApiState<DynamicSystemStatus[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchHistory = useCallback(
    async (id?: string, query?: HistoryQuery) => {
      const targetId = id || clientId;

      if (!targetId) {
        const error = new Error('Client ID is required');
        const userError = handleApiError(error);
        setState({ data: null, loading: false, error: userError });
        return;
      }

      // Keep existing data while loading new data
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const history = await apiClient.fetchClientHistory(targetId, query);
        setState({ data: history, loading: false, error: null });
        return history;
      } catch (error) {
        const userError = handleApiError(error);
        logError(error, 'useClientHistory');
        // Keep existing data on error
        setState(prev => ({ ...prev, loading: false, error: userError }));
        throw error;
      }
    },
    [clientId]
  );

  const retry = useCallback(() => {
    return fetchHistory();
  }, [fetchHistory]);

  return {
    ...state,
    fetchHistory,
    retry,
  };
}
