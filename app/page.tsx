'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slideVariants, expandVariants } from '@/lib/animation-config';
import { Header } from '@/components/header';
import { Container } from '@/components/container';
import { TagFilter } from '@/components/tag-filter';
import { GroupView } from '@/components/group-view';
import { ErrorDisplay } from '@/components/error-display';
import { VirtualizedGrid } from '@/components/virtualized-grid';
import { useClientDetail, useClientHistory } from '@/lib/use-api';
import { useIncrementalClients } from '@/lib/use-incremental-clients';
import { ClientSummary } from '@/lib/api-client';
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
 * Requirements: 5.1, 5.3, 5.5
 */
export default function DashboardPage() {
  // API hooks with incremental updates
  const {
    data: clients,
    loading,
    error,
    fetchClients,
    retry,
    lastUpdate,
  } = useIncrementalClients();
  const { data: selectedClientDetail, fetchDetail } = useClientDetail();
  const { data: clientHistory, fetchHistory } = useClientHistory();

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Apply offline detection and tag filtering
  const processedClients = clients
    ? filterClientsByTags(applyOfflineDetection(clients), selectedTags)
    : [];

  // Extract all available tags
  const allTags = clients ? extractAllTags(clients) : [];

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

  // Handle client card click - fetch detail and history
  const handleClientClick = useCallback(
    async (clientId: string) => {
      if (expandedClientId === clientId) {
        // Collapse if already expanded
        setExpandedClientId(null);
        setExpandedMetric(null);
      } else {
        // Expand and fetch details
        setExpandedClientId(clientId);
        setExpandedMetric('network'); // Default to network chart

        // Fetch client detail
        await fetchDetail(clientId);

        // Fetch last 24 hours of history
        const endTime = Date.now();
        const startTime = endTime - 24 * 60 * 60 * 1000;
        await fetchHistory(clientId, { startTime, endTime });
      }
    },
    [expandedClientId, fetchDetail, fetchHistory]
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

  // Get group by value based on view mode
  const getGroupBy = (): 'tags' | 'purpose' | 'platform' => {
    if (viewMode === 'group-tags') return 'tags';
    if (viewMode === 'group-purpose') return 'purpose';
    if (viewMode === 'group-platform') return 'platform';
    return 'tags';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo and Theme Toggle */}
      <Header title="系统监控平台" />

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
                  网格视图
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
                  按标签分组
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
                  按用途分组
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
                  按平台分组
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
                刷新
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
                <p className="text-foreground-secondary">加载客户端数据...</p>
              </div>
            </div>
          )}

          {/* Client List */}
          {!loading && processedClients && processedClients.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <VirtualizedGrid clients={processedClients} onClientClick={handleClientClick} />
              ) : (
                <GroupView
                  clients={processedClients}
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
                {selectedTags.length > 0 ? '没有匹配的客户端' : '暂无客户端数据'}
              </p>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-primary hover:text-primary/80 text-sm"
                >
                  清除筛选条件
                </button>
              )}
            </div>
          )}

          {/* Expanded Client Detail */}
          <AnimatePresence mode="wait">
            {expandedClientId && selectedClientDetail && (
              <motion.div
                variants={expandVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="mt-8 overflow-hidden"
                style={{
                  willChange: 'height, opacity',
                }}
              >
                <div className="rounded-lg border border-border bg-card p-6">
                  {/* Detail Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedClientDetail.clientName}</h2>
                      <p className="text-foreground-secondary">
                        {selectedClientDetail.hostname} • {selectedClientDetail.platform}
                      </p>
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
                      <p className="font-medium">{selectedClientDetail.staticInfo.cpuModel}</p>
                      <p className="text-xs text-foreground-secondary">
                        {selectedClientDetail.staticInfo.cpuCores} 核心 •{' '}
                        {selectedClientDetail.staticInfo.cpuArch}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-foreground-secondary">系统</p>
                      <p className="font-medium">{selectedClientDetail.staticInfo.systemVersion}</p>
                      <p className="text-xs text-foreground-secondary">
                        {selectedClientDetail.staticInfo.systemModel}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-foreground-secondary">内存</p>
                      <p className="font-medium">
                        {(selectedClientDetail.staticInfo.totalMemory / 1024 ** 3).toFixed(1)} GB
                      </p>
                      <p className="text-xs text-foreground-secondary">
                        Swap: {(selectedClientDetail.staticInfo.totalSwap / 1024 ** 3).toFixed(1)}{' '}
                        GB
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-foreground-secondary">磁盘</p>
                      <p className="font-medium">
                        {(selectedClientDetail.staticInfo.totalDisk / 1024 ** 3).toFixed(1)} GB
                      </p>
                      <p className="text-xs text-foreground-secondary">
                        {selectedClientDetail.staticInfo.diskType}
                      </p>
                    </div>
                  </div>

                  {/* Metric Modules */}
                  <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-5 gap-4 mb-6">
                    <MetricModule
                      type="cpu"
                      value={selectedClientDetail.currentStatus.cpuUsage}
                      onExpand={() => handleMetricClick('cpu')}
                      expanded={expandedMetric === 'cpu'}
                    />

                    <MetricModule
                      type="memory"
                      value={selectedClientDetail.currentStatus.memoryUsage}
                      onExpand={() => handleMetricClick('memory')}
                      expanded={expandedMetric === 'memory'}
                    />

                    <MetricModule
                      type="disk"
                      value={selectedClientDetail.currentStatus.diskUsage}
                      onExpand={() => handleMetricClick('disk')}
                      expanded={expandedMetric === 'disk'}
                    />

                    <MetricModule
                      type="network"
                      value={selectedClientDetail.currentStatus.networkUpload}
                      secondaryValue={selectedClientDetail.currentStatus.networkDownload}
                      onExpand={() => handleMetricClick('network')}
                      expanded={expandedMetric === 'network'}
                    />

                    <MetricModule
                      type="swap"
                      value={selectedClientDetail.currentStatus.swapUsage}
                      onExpand={() => handleMetricClick('swap')}
                      expanded={expandedMetric === 'swap'}
                    />
                  </div>

                  {/* History Chart */}
                  {expandedMetric && clientHistory && clientHistory.length > 0 && (
                    <motion.div
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </main>
    </div>
  );
}
