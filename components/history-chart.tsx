'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DynamicSystemStatus } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { MetricType } from './metric-module';

/**
 * Props for HistoryChart component
 */
export interface HistoryChartProps {
  type: MetricType;
  data: DynamicSystemStatus[];
  className?: string;
  timeRange?: string;
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  // Handle small values
  if (bytes < 1) return `${bytes.toFixed(2)} B`;

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  if (i < 0) return `${bytes.toFixed(2)} B`;
  if (i >= sizes.length)
    return `${(bytes / Math.pow(k, sizes.length - 1)).toFixed(1)} ${sizes[sizes.length - 1]}`;

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Format network speed
 */
function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`;
}

/**
 * Format timestamp to time string
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Get chart title based on metric type
 */
function getChartTitle(type: MetricType): string {
  switch (type) {
    case 'cpu':
      return 'CPU Usage History';
    case 'memory':
      return 'Memory Usage History';
    case 'disk':
      return 'Disk Usage History';
    case 'network':
      return 'Network Speed History';
    case 'swap':
      return 'Swap Usage History';
    default:
      return 'Historical Data';
  }
}

/**
 * Get Y-axis label based on metric type
 */
function getYAxisLabel(type: MetricType): string {
  if (type === 'network') {
    return 'Speed';
  }
  return 'Usage (%)';
}

/**
 * Transform data for chart based on metric type
 */
function transformData(type: MetricType, data: DynamicSystemStatus[]) {
  return data.map((status) => {
    const baseData = {
      timestamp: status.timestamp,
      time: formatTime(status.timestamp),
    };

    switch (type) {
      case 'cpu':
        return {
          ...baseData,
          value: status.cpuUsage,
        };
      case 'memory':
        return {
          ...baseData,
          value: status.memoryUsage,
        };
      case 'disk':
        return {
          ...baseData,
          value: status.diskUsage,
        };
      case 'network':
        return {
          ...baseData,
          upload: status.networkUpload ?? 0,
          download: status.networkDownload ?? 0,
        };
      case 'swap':
        return {
          ...baseData,
          value: status.swapUsage,
        };
      default:
        return baseData;
    }
  });
}

/**
 * Custom tooltip component
 */
function CustomTooltip({ active, payload, label, type }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium mb-2">{label}</p>

      {type === 'network' ? (
        <>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-foreground-secondary">Upload:</span>
            <span className="font-semibold">{formatSpeed(payload?.[0]?.value ?? 0)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-foreground-secondary">Download:</span>
            <span className="font-semibold">{formatSpeed(payload?.[1]?.value ?? 0)}</span>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-foreground-secondary">Usage:</span>
          <span className="font-semibold">{payload?.[0]?.value?.toFixed(1) ?? 0}%</span>
        </div>
      )}
    </div>
  );
}

/**
 * Calculate start time based on time range
 */
function calculateStartTime(range: string): number {
  const endTime = Date.now();
  switch (range) {
    case '4h':
      return endTime - 4 * 60 * 60 * 1000;
    case '8h':
      return endTime - 8 * 60 * 60 * 1000;
    case '12h':
      return endTime - 12 * 60 * 60 * 1000;
    case '24h':
      return endTime - 24 * 60 * 60 * 1000;
    case '7days':
      return endTime - 7 * 24 * 60 * 60 * 1000;
    case '30days':
      return endTime - 30 * 24 * 60 * 60 * 1000;
    case '60days':
      return endTime - 60 * 24 * 60 * 60 * 1000;
    case '90days':
      return endTime - 90 * 24 * 60 * 60 * 1000;
    case '180days':
      return endTime - 180 * 24 * 60 * 60 * 1000;
    case '365days':
      return endTime - 365 * 24 * 60 * 60 * 1000;
    default:
      return endTime - 4 * 60 * 60 * 1000;
  }
}

/**
 * HistoryChart Component
 * Displays historical trend data for monitoring metrics
 */
// Animation variants for chart container
export const HistoryChart = React.memo(function HistoryChart({
  type,
  data,
  className,
  timeRange = '4h',
}: HistoryChartProps) {
  // Filter data based on time range
  const filteredData = data.filter((item) => {
    const startTime = calculateStartTime(timeRange);
    return item.timestamp >= startTime;
  });

  const chartData = transformData(type, filteredData);
  const title = getChartTitle(type);
  const yAxisLabel = getYAxisLabel(type);

  // If no data, show empty state
  if (!filteredData || filteredData.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border border-border bg-card p-6',
          'flex items-center justify-center',
          'min-h-[300px]',
          className
        )}
      >
        <div className="text-center">
          <p className="text-foreground-secondary text-sm">No historical data available</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn('rounded-lg border border-border bg-card p-6', className)}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{
        duration: 0.5,
        ease: [0.6, -0.05, 0.01, 0.99], // Elastic easing
        height: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
      }}
    >
      {/* Chart Title */}
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      {/* Chart Container */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" opacity={0.3} />

          <XAxis
            dataKey="time"
            stroke="rgb(var(--foreground-secondary))"
            tick={{ fill: 'rgb(var(--foreground-secondary))', fontSize: 12 }}
            tickLine={{ stroke: 'rgb(var(--border))' }}
          />

          <YAxis
            stroke="rgb(var(--foreground-secondary))"
            tick={{ fill: 'rgb(var(--foreground-secondary))', fontSize: 12 }}
            tickLine={{ stroke: 'rgb(var(--border))' }}
            label={{
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'rgb(var(--foreground-secondary))', fontSize: 12 },
            }}
            tickFormatter={type === 'network' ? formatBytes : undefined}
          />

          <Tooltip
            content={<CustomTooltip type={type} />}
            cursor={{ stroke: 'rgb(var(--border))', strokeWidth: 1 }}
            animationDuration={0}
          />

          {/* Network chart: dual curves for upload and download */}
          {type === 'network' ? (
            <>
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                formatter={(value) => {
                  return <span style={{ color: 'rgb(var(--foreground))' }}>{value}</span>;
                }}
              />
              <Line
                type="monotone"
                dataKey="upload"
                name="Upload"
                stroke="rgb(var(--primary))"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={400}
              />
              <Line
                type="monotone"
                dataKey="download"
                name="Download"
                stroke="rgb(var(--success))"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={400}
              />
            </>
          ) : (
            // Single curve for other metrics
            <Line
              type="monotone"
              dataKey="value"
              stroke="rgb(var(--primary))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={400}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
});
