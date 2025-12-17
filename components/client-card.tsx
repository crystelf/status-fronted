'use client';

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Circle, Tag, Activity, Server, Monitor, Smartphone } from 'lucide-react';
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ClientSummary, ClientDetail } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { cardVariants, tapAnimation } from '@/lib/animation-config';

interface ClientCardProps {
  client: ClientSummary | ClientDetail;
  onClick?: (clientId: string) => void;
  index?: number;
}

/**
 * Get platform icon component based on OS type
 */
function getPlatformIcon(platform: string) {
  const platformLower = platform.toLowerCase();
  if (platformLower.includes('windows') || platformLower === 'win32') {
    return Monitor;
  } else if (platformLower.includes('linux')) {
    return Server;
  } else if (platformLower.includes('darwin') || platformLower.includes('mac')) {
    return Smartphone;
  }
  return Server;
}

/**
 * Get simplified platform name
 */
function getPlatformName(platform: string, systemVersion?: string): string {
  const platformLower = platform.toLowerCase();
  if (platformLower.includes('windows')) {
    return 'Windows';
  } else if (platformLower.includes('linux')) {
    if (systemVersion) {
      // Extract distro name from version string like "Ubuntu 24.04" or "Debian"
      const match = systemVersion.match(/^([A-Za-z]+)/);
      return match ? match[1] : 'Linux';
    }
    return 'Linux';
  } else if (platformLower.includes('darwin') || platformLower.includes('mac')) {
    return 'macOS';
  }
  return platform;
}

/**
 * Format bytes to human-readable format
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
 * Get usage color based on percentage
 */
function getUsageColor(value: number): string {
  if (value >= 80) return 'rgb(var(--danger))';
  if (value >= 60) return 'rgb(var(--warning))';
  return 'rgb(var(--success))';
}

/**
 * Get free color - visible in both light and dark mode
 */
function getFreeColor(): string {
  return 'rgb(var(--free-color))';
}

/**
 * Interactive Donut Chart with hover effects and lift animation
 */
function UsageDonut({
  label,
  value,
  usedColor,
  detail,
  memoryInfo,
}: {
  label: string;
  value: number | undefined;
  usedColor: string;
  detail?: string;
  memoryInfo?: { used: number; total: number };
}) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const safeValue = Number.isFinite(value) ? Math.min(Math.max(value ?? 0, 0), 100) : 0;
  const freeValue = 100 - safeValue;

  const data = [
    { name: 'used', value: safeValue, color: usedColor },
    { name: 'free', value: freeValue, color: getFreeColor() }, // Adaptive color for visibility in both modes
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="relative h-20 w-20"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="65%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              stroke="none"
              onMouseEnter={(_: any, index: number) => setHoveredSegment(data[index].name)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{
                    filter: hoveredSegment === entry.name ? 'brightness(1.2)' : 'none',
                    transition: 'filter 0.2s, transform 0.2s',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm font-bold">{safeValue.toFixed(1)}%</span>
        </div>
      </motion.div>
      <div className="text-center">
        <div className="text-xs font-semibold">{label}</div>
        {memoryInfo ? (
          <div className="text-xs text-foreground-secondary mt-0.5">
            {memoryInfo.used.toFixed(1)}g/{memoryInfo.total.toFixed(1)}g
          </div>
        ) : detail ? (
          <div className="text-xs text-foreground-secondary mt-0.5">{detail}</div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Disk usage progress bar for multiple disks
 */
function MultiDiskUsage({
  diskUsages,
}: {
  diskUsages: Array<{
    device: string;
    size: number;
    used: number;
    available: number;
    usagePercent: number;
    mountpoint?: string;
  }>;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sort disks by usage percentage (highest first)
  const sortedDisks = [...diskUsages].sort((a, b) => b.usagePercent - a.usagePercent);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-foreground">Disk Usage</h4>
      {sortedDisks.map((disk, index) => {
        const usedColor = getUsageColor(disk.usagePercent);
        const usedGB = (disk.used / 1024 ** 3).toFixed(1);
        const totalGB = (disk.size / 1024 ** 3).toFixed(1);

        // Format device name for display
        let displayName = disk.device;
        if (disk.mountpoint && disk.mountpoint !== disk.device) {
          displayName = `${disk.device} (${disk.mountpoint})`;
        }

        return (
          <div
            key={disk.device}
            className="space-y-1.5"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold truncate max-w-[60%]" title={displayName}>
                {displayName}
              </span>
              <span className="text-foreground-secondary">
                {usedGB}g / {totalGB}g
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: getFreeColor() }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: usedColor }}
                initial={{ width: 0 }}
                animate={{
                  width: `${disk.usagePercent}%`,
                  filter: hoveredIndex === index ? 'brightness(1.2)' : 'brightness(1)',
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Network line chart for mini view
 */
function NetworkLineChart({
  upload,
  download,
  history,
}: {
  upload?: number;
  download?: number;
  history?: Array<{ timestamp: number; upload: number; download: number }>;
}) {
  // Generate mock history data if not provided (for preview)
  const chartData = history
    ? history.slice(-20).map((h) => ({
        time: new Date(h.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        upload: h.upload,
        download: h.download,
      }))
    : Array.from({ length: 20 }, (_, i) => ({
        time: `${i}`,
        upload: (upload || 0) * (0.8 + Math.random() * 0.4),
        download: (download || 0) * (0.8 + Math.random() * 0.4),
      }));

  const maxValue = Math.max(...chartData.map((d) => Math.max(d.upload, d.download)), 1);

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgb(var(--border))"
            opacity={0.3}
          />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'rgb(var(--foreground-secondary))', fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatBytes(value)}
            tick={{ fill: 'rgb(var(--foreground-secondary))', fontSize: 10 }}
            domain={[0, maxValue * 1.1]}
          />
          <RechartsTooltip
            formatter={(value: any) => formatSpeed(Number(value))}
            labelStyle={{ color: 'rgb(var(--foreground-secondary))', fontSize: 12 }}
            contentStyle={{
              background: 'rgb(var(--card))',
              border: '1px solid rgb(var(--border))',
              borderRadius: 8,
            }}
          />
          <Line
            type="monotone"
            dataKey="upload"
            stroke="rgb(var(--primary))"
            strokeWidth={2}
            dot={false}
            name="Upload"
          />
          <Line
            type="monotone"
            dataKey="download"
            stroke="rgb(var(--success))"
            strokeWidth={2}
            dot={false}
            name="Download"
          />
        </LineChart>
      </ResponsiveContainer>
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
 * Modern card design with donut charts and line graphs
 */
export const ClientCard = memo(
  function ClientCard({ client, onClick, index = 0 }: ClientCardProps) {
    const isOnline = client.status === 'online';
    const hasDetailedInfo = isClientDetail(client);
    const status = hasDetailedInfo
      ? 'currentStatus' in client
        ? client.currentStatus
        : undefined
      : undefined;
    const staticInfo = hasDetailedInfo
      ? 'staticInfo' in client
        ? client.staticInfo
        : undefined
      : undefined;

    const PlatformIcon = getPlatformIcon(client.platform);
    const platformName = getPlatformName(client.platform, staticInfo?.systemVersion);

    // Calculate memory info
    const memoryInfo =
      staticInfo && status
        ? {
            used: (staticInfo.totalMemory * status.memoryUsage) / 100 / 1024 ** 3,
            total: staticInfo.totalMemory / 1024 ** 3,
          }
        : undefined;

    // Calculate disk info
    const diskInfo =
      staticInfo && status
        ? {
            used: (staticInfo.totalDisk * status.diskUsage) / 100 / 1024 ** 3,
            total: staticInfo.totalDisk / 1024 ** 3,
          }
        : undefined;

    return (
      <motion.div
        custom={index}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileTap={onClick ? tapAnimation : undefined}
        whileHover={onClick ? { borderColor: 'rgb(59, 130, 246)' } : undefined}
        className={cn(
          'rounded-xl border-2 border-border bg-card p-5',
          'shadow-sm hover:shadow-lg transition-all duration-300',
          onClick && 'cursor-pointer'
        )}
        onClick={() => onClick?.(client.clientId)}
        style={{
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
        }}
      >
        {/* Header: Server Name and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <PlatformIcon className="w-6 h-6 text-foreground-secondary" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold truncate mb-1">{client.hostname}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-foreground-secondary">{platformName}</span>
                {staticInfo?.cpuArch && (
                  <>
                    <span className="text-xs text-foreground-secondary">•</span>
                    <span className="text-xs text-foreground-secondary">{staticInfo.cpuArch}</span>
                  </>
                )}
                {staticInfo?.location && (
                  <>
                    <span className="text-xs text-foreground-secondary">•</span>
                    <span className="text-xs text-foreground-secondary">{staticInfo.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Circle
              className={cn(
                'w-2.5 h-2.5',
                isOnline
                  ? 'fill-success text-success'
                  : 'fill-foreground-secondary text-foreground-secondary'
              )}
            />
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                isOnline
                  ? 'bg-success/10 text-success'
                  : 'bg-foreground-secondary/10 text-foreground-secondary'
              )}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Tags */}
        {client.clientTags && client.clientTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {client.clientTags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-primary/10 text-primary border border-primary/20"
              >
                <Tag className="w-3 h-3" strokeWidth={1.5} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Hardware Section - Three Donut Charts in a row */}
        {status && (
          <>
            <div className="mb-3">
              <div className="grid grid-cols-3 gap-2">
                <UsageDonut
                  label="CPU"
                  value={status.cpuUsage}
                  usedColor={getUsageColor(status.cpuUsage)}
                  detail={staticInfo ? `${staticInfo.cpuCores}C` : undefined}
                />
                <UsageDonut
                  label="Memory"
                  value={status.memoryUsage}
                  usedColor={getUsageColor(status.memoryUsage)}
                  memoryInfo={memoryInfo}
                />
                <UsageDonut
                  label="Swap"
                  value={status.swapUsage > 0 ? status.swapUsage : undefined}
                  usedColor={getUsageColor(status.swapUsage || 0)}
                  detail={status.swapUsage > 0 ? `${status.swapUsage.toFixed(1)}%` : 'N/A'}
                />
              </div>
            </div>

            {/* Network Section - Line Chart */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-semibold text-foreground">Network</h4>
                <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>↑ {formatSpeed(status.networkUpload)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span>↓ {formatSpeed(status.networkDownload)}</span>
                  </div>
                </div>
              </div>
              <NetworkLineChart upload={status.networkUpload} download={status.networkDownload} />
            </div>

            {/* Disk Section - Multiple Disks */}
            {status.diskUsages && status.diskUsages.length > 0 && (
              <div className="mb-3">
                <MultiDiskUsage diskUsages={status.diskUsages} />
              </div>
            )}
          </>
        )}

        {!status && (
          <div className="text-center text-sm text-foreground-secondary py-8">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" strokeWidth={1.5} />
            <p>No real-time occupancy data </p>
          </div>
        )}

        {/* Footer: Last Update */}
        <div className="border-t border-border pt-3 mt-4">
          <div className="flex items-center justify-between text-xs text-foreground-secondary">
            <span>Last updated</span>
            <span>{new Date(client.lastUpdate).toLocaleTimeString('en-US')}</span>
          </div>
        </div>
      </motion.div>
    );
  },
  (prevProps: ClientCardProps, nextProps: ClientCardProps) => {
    // Custom comparison function for memo
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
