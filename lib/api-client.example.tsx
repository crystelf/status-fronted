/**
 * API Client Usage Examples
 * This file demonstrates how to use the API client in React components
 */

'use client';

import { useEffect } from 'react';
import { useAllClients, useClientDetail, useClientHistory } from './use-api';
import { ErrorDisplay } from '@/components/error-display';

/**
 * Example 1: Fetch all clients
 */
export function ClientListExample() {
  const { data: clients, loading, error, fetchClients, retry } = useAllClients();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={retry} />;
  }

  return (
    <div>
      <h2>客户端列表</h2>
      {clients?.map((client) => (
        <div key={client.clientId}>
          <h3>{client.clientName}</h3>
          <p>状态: {client.status}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 2: Fetch client detail
 */
export function ClientDetailExample({ clientId }: { clientId: string }) {
  const { data: detail, loading, error, fetchDetail, retry } = useClientDetail();

  useEffect(() => {
    fetchDetail(clientId);
  }, [clientId, fetchDetail]);

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={retry} />;
  }

  if (!detail) {
    return null;
  }

  return (
    <div>
      <h2>{detail.clientName}</h2>
      <p>CPU: {detail.currentStatus.cpuUsage}%</p>
      <p>内存: {detail.currentStatus.memoryUsage}%</p>
    </div>
  );
}

/**
 * Example 3: Fetch client history
 */
export function ClientHistoryExample({ clientId }: { clientId: string }) {
  const { data: history, loading, error, fetchHistory, retry } = useClientHistory();

  useEffect(() => {
    const endTime = Date.now();
    const startTime = endTime - 24 * 60 * 60 * 1000; // Last 24 hours
    
    fetchHistory(clientId, { startTime, endTime });
  }, [clientId, fetchHistory]);

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={retry} />;
  }

  return (
    <div>
      <h2>历史数据</h2>
      {history?.map((status, index) => (
        <div key={index}>
          <p>时间: {new Date(status.timestamp).toLocaleString()}</p>
          <p>CPU: {status.cpuUsage}%</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 4: Direct API client usage (without hooks)
 */
export async function directApiExample() {
  const { apiClient } = await import('./api-client');
  
  try {
    // Fetch all clients
    const clients = await apiClient.fetchAllClients();
    console.log('Clients:', clients);

    // Fetch specific client
    if (clients.length > 0) {
      const detail = await apiClient.fetchClientDetail(clients[0].clientId);
      console.log('Detail:', detail);

      // Fetch history
      const history = await apiClient.fetchClientHistory(clients[0].clientId, {
        startTime: Date.now() - 3600000, // Last hour
        endTime: Date.now(),
      });
      console.log('History:', history);
    }
  } catch (error) {
    console.error('API Error:', error);
  }
}
