'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiskInfo, DiskUsage } from '@/lib/api-client';

/**
 * Props for MultiDiskDetail component
 */
export interface MultiDiskDetailProps {
  disks: DiskInfo[];
  diskUsages: DiskUsage[];
  className?: string;
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
  return 'hsl(var(--border-h) var(--border-s) calc(var(--border-l) * 1.3))';
}

/**
 * MultiDiskDetail Component
 * Displays detailed information for multiple disks
 */
export const MultiDiskDetail = memo(function MultiDiskDetail({
  disks,
  diskUsages,
  className
}: MultiDiskDetailProps) {
  // Sort disks by usage percentage (highest first)
  const sortedDisks = [...diskUsages].sort((a, b) => b.usagePercent - a.usagePercent);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <HardDrive className="w-5 h-5 text-foreground-secondary" />
        <h3 className="text-lg font-semibold">Disk Details</h3>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
        {sortedDisks.map((diskUsage, index) => {
          // Find matching disk info
          const diskInfo = disks.find(d => d.device === diskUsage.device);
          const usedColor = getUsageColor(diskUsage.usagePercent);
          
          // Format device name for display
          let displayName = diskUsage.device;
          if (diskUsage.mountpoint && diskUsage.mountpoint !== diskUsage.device) {
            displayName = `${diskUsage.device} (${diskUsage.mountpoint})`;
          }

          return (
            <motion.div
              key={diskUsage.device}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="space-y-3">
                {/* Device Name */}
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate" title={displayName}>
                    {displayName}
                  </h4>
                  <span 
                    className="text-sm font-medium px-2 py-1 rounded-md"
                    style={{ color: usedColor }}
                  >
                    {diskUsage.usagePercent.toFixed(1)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: getFreeColor() }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: usedColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${diskUsage.usagePercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>

                {/* Disk Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-foreground-secondary">Size:</span>
                    <span className="ml-1 font-medium">{formatBytes(diskUsage.size)}</span>
                  </div>
                  <div>
                    <span className="text-foreground-secondary">Used:</span>
                    <span className="ml-1 font-medium">{formatBytes(diskUsage.used)}</span>
                  </div>
                  <div>
                    <span className="text-foreground-secondary">Free:</span>
                    <span className="ml-1 font-medium">{formatBytes(diskUsage.available)}</span>
                  </div>
                  {diskInfo && (
                    <div>
                      <span className="text-foreground-secondary">Type:</span>
                      <span className="ml-1 font-medium">{diskInfo.type}</span>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                {diskInfo?.interfaceType && (
                  <div className="text-xs text-foreground-secondary">
                    Interface: {diskInfo.interfaceType}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});