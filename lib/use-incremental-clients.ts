/**
 * Hook for incremental client updates
 * Only updates changed data to avoid full re-renders
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient, ClientSummary } from './api-client';
import { handleApiError, logError, UserFriendlyError } from './error-handler';

interface IncrementalState {
  clients: Map<string, ClientSummary>;
  loading: boolean;
  error: UserFriendlyError | null;
  lastUpdate: number;
}

/**
 * Compare two client objects to detect changes
 */
function hasClientChanged(oldClient: ClientSummary, newClient: ClientSummary): boolean {
  // Check critical fields that would require re-render
  return (
    oldClient.status !== newClient.status ||
    oldClient.lastUpdate !== newClient.lastUpdate ||
    oldClient.clientName !== newClient.clientName ||
    JSON.stringify(oldClient.clientTags) !== JSON.stringify(newClient.clientTags) ||
    oldClient.clientPurpose !== newClient.clientPurpose
  );
}

/**
 * Hook for incremental client updates
 * Maintains a Map of clients and only updates changed entries
 */
export function useIncrementalClients() {
  const [state, setState] = useState<IncrementalState>({
    clients: new Map(),
    loading: false,
    error: null,
    lastUpdate: 0,
  });

  // Track which clients have changed for efficient updates
  const changedClientsRef = useRef<Set<string>>(new Set());

  const fetchClients = useCallback(async () => {
    // Don't show loading on subsequent fetches (incremental updates)
    const isInitialLoad = state.clients.size === 0;

    setState((prev) => ({
      ...prev,
      loading: isInitialLoad,
      error: null,
    }));

    try {
      const newClients = await apiClient.fetchAllClients();
      const now = Date.now();

      setState((prev) => {
        const updatedClients = new Map(prev.clients);
        const changedIds = new Set<string>();

        // Track existing client IDs
        const existingIds = new Set(updatedClients.keys());
        const newIds = new Set(newClients.map((c) => c.clientId));

        // Update or add clients
        newClients.forEach((newClient) => {
          const existingClient = updatedClients.get(newClient.clientId);

          if (!existingClient || hasClientChanged(existingClient, newClient)) {
            updatedClients.set(newClient.clientId, newClient);
            changedIds.add(newClient.clientId);
          }
        });

        // Remove clients that no longer exist
        existingIds.forEach((id) => {
          if (!newIds.has(id)) {
            updatedClients.delete(id);
            changedIds.add(id);
          }
        });

        // Store changed IDs for potential use
        changedClientsRef.current = changedIds;

        return {
          clients: updatedClients,
          loading: false,
          error: null,
          lastUpdate: now,
        };
      });

      return Array.from(state.clients.values());
    } catch (error) {
      const userError = handleApiError(error);
      logError(error, 'useIncrementalClients');

      setState((prev) => ({
        ...prev,
        loading: false,
        error: userError,
      }));

      throw error;
    }
  }, [state.clients]);

  const retry = useCallback(() => {
    return fetchClients();
  }, [fetchClients]);

  // Convert Map to Array for consumption
  const clientsArray = Array.from(state.clients.values());

  return {
    data: clientsArray,
    loading: state.loading,
    error: state.error,
    lastUpdate: state.lastUpdate,
    changedClients: changedClientsRef.current,
    fetchClients,
    retry,
  };
}

/**
 * Hook for tracking specific client changes
 * Useful for optimizing re-renders of individual components
 */
export function useClientChangeTracker(clientId: string, clients: ClientSummary[]) {
  const [hasChanged, setHasChanged] = useState(false);
  const previousClientRef = useRef<ClientSummary | null>(null);

  useEffect(() => {
    const currentClient = clients.find((c) => c.clientId === clientId);

    if (!currentClient) {
      setHasChanged(false);
      previousClientRef.current = null;
      return;
    }

    if (!previousClientRef.current) {
      previousClientRef.current = currentClient;
      setHasChanged(true);
      return;
    }

    const changed = hasClientChanged(previousClientRef.current, currentClient);
    setHasChanged(changed);

    if (changed) {
      previousClientRef.current = currentClient;
    }
  }, [clientId, clients]);

  return hasChanged;
}
