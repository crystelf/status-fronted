'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, MemoryStick, Network, Circle, Tag } from 'lucide-react';
import { ClientSummary, ClientDetail } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { cardVariants, tapAnimation, getAccessibleTransition } from '@/lib/animation-config';

interface ClientCardProps {
  client: ClientSummary | ClientDetail;
  onClick?: (clientId: string) => void;
  index?: number;
}

/**
 * Get platform icon based on OS type
 */
function getPlatformIcon(platform: string) {
  const platformLower = platform.toLowerCase();

  if (platformLower.includes('windows') || platformLower === 'win32') {
    return '🪟';
  } else if (platformLower.includes('linux')) {
    return '🐧';
  } else if (platformLower.includes('darwin') || platformLower.includes('mac')) {
    return '🍎';
  }

  return '🖥️';
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Format network speed
 */
function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`;
}

/**
 * Get time ago string
 */
function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return `${seconds}秒前`;
}

/**
 * Progress bar component with GPU-accelerated animation
 * Uses scaleX transform instead of width for better performance
 */
function ProgressBar({ value, className }: { value: number; className?: string }) {
  const percentage = Math.min(Math.max(value, 0), 100);

  // Color based on usage
  let colorClass = 'bg-success';
  if (percentage >= 80) {
    colorClass = 'bg-danger';
  } else if (percentage >= 60) {
    colorClass = 'bg-warning';
  }

  return (
    <div
      className={cn('h-2 w-full bg-background-secondary rounded-full overflow-hidden', className)}
    >
      <motion.div
        className={cn('h-full rounded-full', colorClass)}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: percentage / 100 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          originX: 0,
          transformOrigin: 'left',
          willChange: 'transform',
        }}
      />
    </div>
  );
}

/**
 * Check if client has detailed status information
 */
function isClientDetail(client: ClientSummary | ClientDetail): client is ClientDetail {
  return 'currentStatus' in client && 'staticInfo' in client;
}

/**
 * ClientCard Component
 * Displays client status with animations and interactive features
 * Memoized to prevent unnecessary re-renders during incremental updates
 * Requirements: 5.2, 5.3, 9.3, 9.4, 9.7, 9.8
 */
export const ClientCard = memo(
  function ClientCard({ client, onClick, index = 0 }: ClientCardProps) {
    const isOnline = client.status === 'online';
    const hasDetailedInfo = isClientDetail(client);

    return (
      <motion.div
        custom={index}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileTap={onClick ? tapAnimation : undefined}
        className={cn(
          'rounded-lg border border-border bg-card p-6',
          'shadow-sm hover:shadow-md transition-shadow duration-200',
          onClick && 'cursor-pointer hover:bg-card-hover'
        )}
        onClick={() => onClick?.(client.clientId)}
        style={{
          // Force GPU acceleration
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
        }}
      >
        {/* Header: Name and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0" aria-label={`Platform: ${client.platform}`}>
              {getPlatformIcon(client.platform)}
            </span>
            <h3 className="text-lg font-semibold truncate" title={client.clientName}>
              {client.clientName}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            <Circle
              className={cn(
                'w-3 h-3',
                isOnline
                  ? 'fill-success text-success'
                  : 'fill-foreground-secondary text-foreground-secondary'
              )}
            />
            <span
              className={cn(
                'text-sm font-medium',
                isOnline ? 'text-success' : 'text-foreground-secondary'
              )}
            >
              {isOnline ? '在线' : '离线'}
            </span>
          </div>
        </div>

        {/* Tags */}
        {client.clientTags && client.clientTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {client.clientTags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Purpose */}
        {client.clientPurpose && (
          <p
            className="text-sm text-foreground-secondary mb-4 line-clamp-2"
            title={client.clientPurpose}
          >
            用途: {client.clientPurpose}
          </p>
        )}

        <div className="border-t border-border my-4" />

        {/* System Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-secondary">系统</span>
            <span
              className="font-medium truncate ml-2"
              title={`${client.platform} ${hasDetailedInfo ? client.staticInfo.systemVersion : ''}`}
            >
              {client.platform} {hasDetailedInfo && client.staticInfo.systemVersion}
            </span>
          </div>

          {hasDetailedInfo && client.staticInfo.location && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground-secondary">位置</span>
              <span className="font-medium">{client.staticInfo.location}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-secondary">主机名</span>
            <span className="font-medium truncate ml-2" title={client.hostname}>
              {client.hostname}
            </span>
          </div>
        </div>

        {/* Metrics - Only show if we have detailed status */}
        {hasDetailedInfo && client.currentStatus && (
          <>
            <div className="border-t border-border my-4" />

            <div className="space-y-3">
              {/* CPU */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-foreground-secondary" />
                    <span className="text-foreground-secondary">CPU</span>
                  </div>
                  <span className="font-medium">{client.currentStatus.cpuUsage.toFixed(1)}%</span>
                </div>
                <ProgressBar value={client.currentStatus.cpuUsage} />
              </div>

              {/* Memory */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <MemoryStick className="w-4 h-4 text-foreground-secondary" />
                    <span className="text-foreground-secondary">内存</span>
                  </div>
                  <span className="font-medium">
                    {client.currentStatus.memoryUsage.toFixed(1)}%
                  </span>
                </div>
                <ProgressBar value={client.currentStatus.memoryUsage} />
              </div>

              {/* Disk */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-foreground-secondary" />
                    <span className="text-foreground-secondary">磁盘</span>
                  </div>
                  <span className="font-medium">{client.currentStatus.diskUsage.toFixed(1)}%</span>
                </div>
                <ProgressBar value={client.currentStatus.diskUsage} />
              </div>

              {/* Network */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-foreground-secondary" />
                    <span className="text-foreground-secondary">网络</span>
                  </div>
                  <span className="font-medium text-xs">
                    ↑{formatSpeed(client.currentStatus.networkUpload)} ↓
                    {formatSpeed(client.currentStatus.networkDownload)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="border-t border-border my-4" />

        {/* Last Update */}
        <div className="flex items-center justify-between text-sm text-foreground-secondary">
          <span>最后更新</span>
          <span>{getTimeAgo(client.lastUpdate)}</span>
        </div>
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    // Only re-render if client data actually changed
    return (
      prevProps.client.clientId === nextProps.client.clientId &&
      prevProps.client.status === nextProps.client.status &&
      prevProps.client.lastUpdate === nextProps.client.lastUpdate &&
      prevProps.client.clientName === nextProps.client.clientName &&
      JSON.stringify(prevProps.client.clientTags) === JSON.stringify(nextProps.client.clientTags) &&
      prevProps.client.clientPurpose === nextProps.client.clientPurpose &&
      prevProps.index === nextProps.index
    );
  }
);
