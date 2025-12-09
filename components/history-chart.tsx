'use client'

import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { DynamicSystemStatus } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { MetricType } from './metric-module'

/**
 * Props for HistoryChart component
 */
export interface HistoryChartProps {
  type: MetricType
  data: DynamicSystemStatus[]
  className?: string
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Format network speed
 */
function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`
}

/**
 * Format timestamp to time string
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Get chart title based on metric type
 */
function getChartTitle(type: MetricType): string {
  switch (type) {
    case 'cpu':
      return 'CPU 使用率历史'
    case 'memory':
      return '内存使用率历史'
    case 'disk':
      return '磁盘使用率历史'
    case 'network':
      return '网络速率历史'
    case 'swap':
      return 'Swap 使用率历史'
    default:
      return '历史数据'
  }
}

/**
 * Get Y-axis label based on metric type
 */
function getYAxisLabel(type: MetricType): string {
  if (type === 'network') {
    return '速率'
  }
  return '使用率 (%)'
}

/**
 * Transform data for chart based on metric type
 */
function transformData(type: MetricType, data: DynamicSystemStatus[]) {
  return data.map((status) => {
    const baseData = {
      timestamp: status.timestamp,
      time: formatTime(status.timestamp)
    }
    
    switch (type) {
      case 'cpu':
        return {
          ...baseData,
          value: status.cpuUsage
        }
      case 'memory':
        return {
          ...baseData,
          value: status.memoryUsage
        }
      case 'disk':
        return {
          ...baseData,
          value: status.diskUsage
        }
      case 'network':
        return {
          ...baseData,
          upload: status.networkUpload,
          download: status.networkDownload
        }
      case 'swap':
        return {
          ...baseData,
          value: status.swapUsage
        }
      default:
        return baseData
    }
  })
}

/**
 * Custom tooltip component
 */
function CustomTooltip({ active, payload, label, type }: any) {
  if (!active || !payload || !payload.length) {
    return null
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-lg p-3 shadow-lg"
    >
      <p className="text-sm font-medium mb-2">{label}</p>
      
      {type === 'network' ? (
        <>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-foreground-secondary">上行:</span>
            <span className="font-semibold">{formatSpeed(payload[0]?.value || 0)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-foreground-secondary">下行:</span>
            <span className="font-semibold">{formatSpeed(payload[1]?.value || 0)}</span>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-foreground-secondary">使用率:</span>
          <span className="font-semibold">{payload[0]?.value?.toFixed(1)}%</span>
        </div>
      )}
    </motion.div>
  )
}

/**
 * HistoryChart Component
 * Displays historical trend data for monitoring metrics
 * Requirements: 5.4, 9.4, 9.5, 9.6
 * 
 * Features:
 * - Uses Recharts library for smooth animations
 * - Network chart displays dual curves (upload + download)
 * - Responsive chart sizing
 * - Smooth data transition animations
 */
export function HistoryChart({ type, data, className }: HistoryChartProps) {
  const chartData = transformData(type, data)
  const title = getChartTitle(type)
  const yAxisLabel = getYAxisLabel(type)
  
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-lg border border-border bg-card p-6',
          'flex items-center justify-center',
          'min-h-[300px]',
          className
        )}
      >
        <div className="text-center">
          <p className="text-foreground-secondary text-sm">暂无历史数据</p>
        </div>
      </motion.div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'rounded-lg border border-border bg-card p-6',
        className
      )}
    >
      {/* Chart Title */}
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      {/* Chart Container */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgb(var(--border))"
            opacity={0.3}
          />
          
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
              style: { fill: 'rgb(var(--foreground-secondary))', fontSize: 12 }
            }}
            tickFormatter={type === 'network' ? formatBytes : undefined}
          />
          
          <Tooltip 
            content={<CustomTooltip type={type} />}
            cursor={{ stroke: 'rgb(var(--border))', strokeWidth: 1 }}
          />
          
          {/* Network chart: dual curves for upload and download */}
          {type === 'network' ? (
            <>
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                formatter={(value) => {
                  return <span style={{ color: 'rgb(var(--foreground))' }}>{value}</span>
                }}
              />
              <Line
                type="monotone"
                dataKey="upload"
                name="上行"
                stroke="rgb(var(--primary))"
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
              <Line
                type="monotone"
                dataKey="download"
                name="下行"
                stroke="rgb(var(--success))"
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
                animationEasing="ease-in-out"
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
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
