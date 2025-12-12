'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeVariants, fastTransition, slideVariants, smoothTransition } from '@/lib/animation-config';
import { Header } from '@/components/header';
import { Container } from '@/components/container';
import { TagFilter } from '@/components/tag-filter';
import { GroupView } from '@/components/group-view';
import { ErrorDisplay } from '@/components/error-display';
import { VirtualizedGrid } from '@/components/virtualized-grid';
import { useClientDetail, useClientHistory } from '@/lib/use-api';
import { useIncrementalClients } from '@/lib/use-incremental-clients';
import { ClientSummary, ClientDetail, apiClient } from '@/lib/api-client';
import { Loader2, Layers, Grid3x3, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricModule } from '@/components/metric-module';
import { HistoryChart } from '@/components/history-chart';

/**
 * View mode type
 */
type ViewMode = 'grid' | 'group-tags' | 'group-purpose' | 'group-platform';

/**
 * Offline detection timeout (5 minutes)
 */
const OFFLINE_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Auto-refresh interval (30 seconds)
 */
const AUTO_REFRESH_INTERVAL_MS = 30 * 1000;

/**
 * Check if client is offline based on last update time
 * Requirements: 5.5
 */
function isClientOffline(lastUpdate: number): boolean {
  const now = Date.now();
  return now - lastUpdate > OFFLINE_TIMEOUT_MS;
}

/**
 * Apply offline status detection to clients
 */
function applyOfflineDetection(clients: ClientSummary[]): ClientSummary[] {
  return clients.map((client) => ({
    ...client,
    status: isClientOffline(client.lastUpdate) ? 'offline' : 'online',
  }));
}

/**
 * Modal animation variants
 */
const modalVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: smoothTransition,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: fastTransition,
  },
};

/**
 * Filter clients by selected tags
 */
function filterClientsByTags(clients: ClientSummary[], selectedTags: string[]): ClientSummary[] {
  if (selectedTags.length === 0) {
    return clients;
  }

  return clients.filter((client) => {
    if (!client.clientTags || client.clientTags.length === 0) {
      return false;
    }
    // Client must have at least one of the selected tags
    return client.clientTags.some((tag) => selectedTags.includes(tag));
  });
}

/**
 * Extract all unique tags from clients
 */
function extractAllTags(clients: ClientSummary[]): string[] {
  const tagSet = new Set<string>();

  clients.forEach((client) => {
    if (client.clientTags && client.clientTags.length > 0) {
      client.clientTags.forEach((tag) => tagSet.add(tag));
    }
  });

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

/**
 * Dashboard Page Component
 * Main monitoring dashboard with auto-refresh and offline detection
 */
export default function DashboardPage() {
  // API hooks with incremental updates
  const {
    data: clients,
    loading,
    error,
    fetchClients,
    retry,
  } = useIncrementalClients();
  const { data: selectedClientDetail, fetchDetail } = useClientDetail();
  const { data: clientHistory, fetchHistory } = useClientHistory();

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clientDetailsMap, setClientDetailsMap] = useState<Map<string, ClientDetail>>(new Map());
  
  // Track pending requests to avoid duplicate requests
  const pendingRequestsRef = useRef<Set<string>>(new Set());
  const prefetchTimeoutRef = useRef<number | null>(null);

  // Apply offline detection and tag filtering - memoized to prevent unnecessary recalculations
  const processedClients = useMemo(() => {
    if (!clients) return [];
    return filterClientsByTags(applyOfflineDetection(clients), selectedTags);
  }, [clients, selectedTags]);

  // Extract all available tags - memoized
  const allTags = useMemo(() => {
    if (!clients) return [];
    return extractAllTags(clients);
  }, [clients]);

  // Initial data fetch
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Auto-refresh functionality
  // Requirements: 5.3
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchClients();
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fetchClients]);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchClients();
    } finally {
      // Keep spinner visible for at least 500ms for better UX
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }, [fetchClients]);

  // Handle client card click - open detail modal
  const handleClientClick = useCallback(
    async (clientId: string) => {
      // Always open the modal
      setExpandedClientId(clientId);
      setExpandedMetric('network'); // Default to network chart

      // Fetch client detail if not in cache
      const cachedDetail = clientDetailsMap.get(clientId);
      if (!cachedDetail) {
        const detail = await fetchDetail(clientId);
        if (detail) {
          setClientDetailsMap((prev: Map<string, ClientDetail>) => {
            const next = new Map(prev);
            next.set(clientId, detail);
            return next;
          });
        }
      }

      // Fetch last 24 hours of history
      const endTime = Date.now();
      const startTime = endTime - 24 * 60 * 60 * 1000;
      await fetchHistory(clientId, { startTime, endTime });
    },
    [fetchDetail, fetchHistory, clientDetailsMap]
  );

  // Handle metric module click
  const handleMetricClick = useCallback((metricType: string) => {
    setExpandedMetric(metricType);
  }, []);

  // Close expanded detail
  const handleCloseDetail = useCallback(() => {
    setExpandedClientId(null);
    setExpandedMetric(null);
  }, []);

  // Prefetch client details for all visible clients
  useEffect(() => {
    if (!processedClients || processedClients.length === 0) return;

    const missing = processedClients.filter(
      (c: ClientSummary) => !clientDetailsMap.has(c.clientId) && !pendingRequestsRef.current.has(c.clientId)
    );

    if (missing.length === 0) return;

    if (prefetchTimeoutRef.current !== null) {
      clearTimeout(prefetchTimeoutRef.current);
    }

    // Immediate fetch for initial load
    const isInitialLoad = clientDetailsMap.size === 0;
    const delay = isInitialLoad ? 100 : 500;
    
    prefetchTimeoutRef.current = window.setTimeout(() => {
      const stillMissing = processedClients.filter(
        (c: ClientSummary) => !clientDetailsMap.has(c.clientId) && !pendingRequestsRef.current.has(c.clientId)
      );

      if (stillMissing.length === 0) return;
      
      // Fetch more aggressively on initial load
      const batchSize = isInitialLoad ? 10 : 5;
      const toFetch = stillMissing.slice(0, batchSize);

      toFetch.forEach((client: ClientSummary) => {
        pendingRequestsRef.current.add(client.clientId);

        apiClient
          .fetchClientDetail(client.clientId)
          .then((detail) => {
            if (detail) {
              setClientDetailsMap((prev: Map<string, ClientDetail>) => {
                if (prev.has(client.clientId)) return prev;
                const next = new Map(prev);
                next.set(client.clientId, detail);
                return next;
              });
            }
          })
          .catch(() => {
            // Silently fail for prefetch
          })
          .finally(() => {
            pendingRequestsRef.current.delete(client.clientId);
          });
      });
    }, delay);

    return () => {
      if (prefetchTimeoutRef.current !== null) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, [processedClients, clientDetailsMap]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (expandedClientId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [expandedClientId]);

  // Get group by value based on view mode
  const getGroupBy = (): 'tags' | 'purpose' | 'platform' => {
    if (viewMode === 'group-tags') return 'tags';
    if (viewMode === 'group-purpose') return 'purpose';
    if (viewMode === 'group-platform') return 'platform';
    return 'tags';
  };

  // Memoize clients with details to prevent unnecessary re-renders
  const clientsWithDetails = useMemo(
    () => processedClients.map((c: ClientSummary) => clientDetailsMap.get(c.clientId) || c),
    [processedClients, clientDetailsMap]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo and Theme Toggle */}
      <Header title="System Status" />

      <main className="py-6">
        <Container>
          {/* Control Bar: Tag Filter, View Mode, Refresh */}
          <div className="mb-6 space-y-4">
            {/* Tag Filter */}
            {allTags.length > 0 && (
              <TagFilter tags={allTags} selectedTags={selectedTags} onTagSelect={setSelectedTags} />
            )}

            {/* View Mode and Refresh Controls */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* View Mode Selector */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium',
                    'border transition-all duration-200',
                    viewMode === 'grid'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  )}
                >
                  <Grid3x3 className="w-4 h-4" />
                  Grid view
                </button>

                <button
                  onClick={() => setViewMode('group-tags')}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium',
                    'border transition-all duration-200',
                    viewMode === 'group-tags'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  )}
                >
                  <Layers className="w-4 h-4" />
                  Group by label
                </button>

                <button
                  onClick={() => setViewMode('group-purpose')}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium',
                    'border transition-all duration-200',
                    viewMode === 'group-purpose'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  )}
                >
                  <Layers className="w-4 h-4" />
                  Group by use
                </button>

                <button
                  onClick={() => setViewMode('group-platform')}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium',
                    'border transition-all duration-200',
                    viewMode === 'group-platform'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  )}
                >
                  <Layers className="w-4 h-4" />
                  Grouped by platform
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium',
                  'bg-card text-foreground border border-border',
                  'hover:bg-card-hover transition-all duration-200',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
                Refresh
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6">
              <ErrorDisplay error={error} onRetry={retry} />
            </div>
          )}

          {/* Loading State */}
          {loading && !clients && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-foreground-secondary">Loading client data...</p>
              </div>
            </div>
          )}

          {/* Client List */}
          {!loading && processedClients && processedClients.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <VirtualizedGrid
                  clients={clientsWithDetails}
                  onClientClick={handleClientClick}
                />
              ) : (
                <GroupView
                  clients={clientsWithDetails}
                  groupBy={getGroupBy()}
                  onClientClick={handleClientClick}
                />
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && processedClients && processedClients.length === 0 && (
            <div className="text-center py-20">
              <p className="text-foreground-secondary text-lg mb-2">
                {selectedTags.length > 0 ? 'There are no matching clients' : 'No client data at the moment'}
              </p>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-primary hover:text-primary/80 text-sm"
                >
                  Clear the filter
                </button>
              )}
            </div>
          )}

        </Container>
      </main>

      <AnimatePresence mode="wait">
        {expandedClientId && (() => {
          const detail = selectedClientDetail || clientDetailsMap.get(expandedClientId);
          if (!detail) return null;
          return (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={handleCloseDetail}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
                <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 tablet:p-8">
                    {/* Detail Header */}
                    <div className="flex items-start justify-between mb-6 gap-4">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold">{'hostname' in detail ? detail.hostname : 'unnamed client'}</h2>
                        <p className="text-foreground-secondary">
                          {'platform' in detail ? detail.platform : 'unknown platform'}
                          {'clientPurpose' in detail && detail.clientPurpose ? ` • ${detail.clientPurpose}` : 'unknown purpose'}
                        </p>
                        {'staticInfo' in detail && detail.staticInfo.location && (
                          <p className="text-sm text-foreground-secondary">
                            {detail.staticInfo.location}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleCloseDetail}
                        className="p-2 rounded-md hover:bg-background-secondary transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Detailed System Info */}
                    <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-4 mb-6">
                      <div className="space-y-1">
                        <p className="text-sm text-foreground-secondary">CPU</p>
                        <p className="font-medium">{'staticInfo' in detail ? detail.staticInfo.cpuModel : 'unknown cpu model'}</p>
                        <p className="text-xs text-foreground-secondary">
                          {'staticInfo' in detail ? detail.staticInfo.cpuCores : 'unknown cpu cores'} C •{' '}
                          {'staticInfo' in detail ? detail.staticInfo.cpuArch : 'unknown cpu arch'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-foreground-secondary">System</p>
                        <p className="font-medium">{'staticInfo' in detail ? detail.staticInfo.systemVersion : 'unknown system version'}</p>
                        <p className="text-xs text-foreground-secondary">
                          {'staticInfo' in detail ? detail.staticInfo.systemModel : 'unknown system model'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-foreground-secondary">Memory</p>
                        <p className="font-medium">
                          {('staticInfo' in detail ? (detail.staticInfo.totalMemory / 1024 ** 3).toFixed(1) : 'unknown memory')} GB
                        </p>
                        <p className="text-xs text-foreground-secondary">
                          {'staticInfo' in detail ? `Swap: ${(detail.staticInfo.totalSwap / 1024 ** 3).toFixed(1)} GB` : 'unknown swap'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-foreground-secondary">Disk</p>
                        <p className="font-medium">
                          {'staticInfo' in detail ? (detail.staticInfo.totalDisk / 1024 ** 3).toFixed(1) : 'unknown disk'} GB
                        </p>
                        <p className="text-xs text-foreground-secondary">
                          {'staticInfo' in detail ? detail.staticInfo.diskType : 'unknown disk type'}
                        </p>
                      </div>
                    </div>

                    {/* Metric Modules */}
                    <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-5 gap-4 mb-6">
                      <MetricModule
                        type="cpu"
                        value={('currentStatus' in detail ? detail.currentStatus.cpuUsage : 'unknown cpu usage') as number}
                        onExpand={() => handleMetricClick('cpu')}
                        expanded={expandedMetric === 'cpu'}
                      />

                      <MetricModule
                        type="memory"
                        value={('currentStatus' in detail ? detail.currentStatus.memoryUsage : 'unknown memory usage') as number}
                        onExpand={() => handleMetricClick('memory')}
                        expanded={expandedMetric === 'memory'}
                      />

                      <MetricModule
                        type="disk"
                        value={('currentStatus' in detail ? detail.currentStatus.diskUsage : 'unknown disk usage') as number}
                        onExpand={() => handleMetricClick('disk')}
                        expanded={expandedMetric === 'disk'}
                      />

                      <MetricModule
                        type="network"
                        value={('currentStatus' in detail ? detail.currentStatus.networkUpload : 'unknown upload rate') as number}
                        secondaryValue={('currentStatus' in detail ? detail.currentStatus.networkDownload : 'unknown download rate') as number}
                        onExpand={() => handleMetricClick('network')}
                        expanded={expandedMetric === 'network'}
                      />

                      <MetricModule
                        type="swap"
                        value={('currentStatus' in detail ? detail.currentStatus.swapUsage : 'unknown swap usage') as number}
                        onExpand={() => handleMetricClick('swap')}
                        expanded={expandedMetric === 'swap'}
                      />
                    </div>

                    {/* History Chart */}
                    <AnimatePresence mode="wait">
                      {expandedMetric && clientHistory && clientHistory.length > 0 && (
                        <motion.div
                          key={expandedMetric}
                          variants={slideVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          style={{
                            willChange: 'transform, opacity',
                          }}
                        >
                          <HistoryChart type={expandedMetric as any} data={clientHistory} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}