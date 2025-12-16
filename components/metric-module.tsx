'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network,
  Droplet,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { hoverAnimation, tapAnimation } from '@/lib/animation-config'

/**
 * Metric type definition
 */
export type MetricType = 'cpu' | 'memory' | 'disk' | 'network' | 'swap'

/**
 * Props for MetricModule component
 */
export interface MetricModuleProps {
  type: MetricType
  value: number
  secondaryValue?: number // For network (upload/download)
  history?: number[]
  onExpand?: () => void
  expanded?: boolean
  className?: string
}

/**
 * Get metric icon based on type
 */
function getMetricIcon(type: MetricType) {
  switch (type) {
    case 'cpu':
      return Cpu
    case 'memory':
      return MemoryStick
    case 'disk':
      return HardDrive
    case 'network':
      return Network
    case 'swap':
      return Droplet
    default:
      return Cpu
  }
}

/**
 * Get metric label based on type
 */
function getMetricLabel(type: MetricType): string {
  switch (type) {
    case 'cpu':
      return 'CPU'
    case 'memory':
      return 'Memory'
    case 'disk':
      return 'Disk'
    case 'network':
      return 'Network'
    case 'swap':
      return 'Swap'
    default:
      return ''
  }
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  
  // Handle small values
  if (bytes < 1) return `${bytes.toFixed(2)} B`

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  if (i < 0) return `${bytes.toFixed(2)} B`
  if (i >= sizes.length) return `${(bytes / Math.pow(k, sizes.length - 1)).toFixed(1)} ${sizes[sizes.length - 1]}`
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Format network speed
 */
function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`
}

/**
 * Format metric value based on type
 */
function formatMetricValue(type: MetricType, value: number, secondaryValue?: number): string {
  if (type === 'network') {
    if (secondaryValue !== undefined) {
      return `↑${formatSpeed(value)} ↓${formatSpeed(secondaryValue)}`
    }
    return formatSpeed(value)
  }
  
  // For CPU, memory, disk, swap - show percentage
  return `${value.toFixed(1)}%`
}

/**
 * Get color class based on usage percentage
 */
function getUsageColor(value: number): string {
  if (value >= 80) return 'text-danger'
  if (value >= 60) return 'text-warning'
  return 'text-success'
}

/**
 * Get progress bar color class based on usage percentage
 */
function getProgressColor(value: number): string {
  if (value >= 80) return 'bg-danger'
  if (value >= 60) return 'bg-warning'
  return 'bg-success'
}

/**
 * Progress bar component with GPU-accelerated animation
 * Uses scaleX transform instead of width for better performance
 */
const ProgressBar = memo(function ProgressBar({ value, className }: { value: number; className?: string }) {
  const percentage = Math.min(Math.max(value, 0), 100)
  const colorClass = getProgressColor(percentage)
  
  return (
    <div className={cn('h-2 w-full bg-background-secondary rounded-full overflow-hidden', className)}>
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
  )
})

/**
 * MetricModule Component
 * Displays a single monitoring metric with icon, progress bar, and expandable chart
 * Optimized with GPU-accelerated animations and memoization
 * Requirements: 9.4, 9.6, 9.7
 */
export const MetricModule = memo(function MetricModule({
  type,
  value,
  secondaryValue,
  history,
  onExpand,
  expanded = false,
  className
}: MetricModuleProps) {
  const Icon = getMetricIcon(type)
  const label = getMetricLabel(type)
  const formattedValue = formatMetricValue(type, value, secondaryValue)
  const colorClass = type === 'network' ? 'text-primary' : getUsageColor(value)
  const isClickable = !!onExpand
  
  // For network, we don't show progress bar
  const showProgressBar = type !== 'network'
  
  return (
    <motion.div
      className={cn(
        'rounded-lg border border-border bg-card p-4',
        'transition-all duration-200',
        isClickable && 'cursor-pointer hover:shadow-md hover:bg-card-hover',
        className
      )}
      onClick={onExpand}
      whileHover={isClickable ? hoverAnimation : undefined}
      whileTap={isClickable ? tapAnimation : undefined}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      {/* Header: Icon, Label */}
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={cn('w-5 h-5', colorClass)} />
        <span className="text-sm font-medium text-foreground-secondary">
          {label}
        </span>
      </div>
      
      {/* Value and Expand Icon */}
      <div className={cn(
        "flex items-center justify-between mb-3",
        // On desktop, stack value below the label for network module
        type === 'network' && 'lg:flex-col lg:items-start lg:gap-2'
      )}>
        <span className={cn('text-0.7xl font-semibold', colorClass)}>
          {formattedValue}
        </span>
        
        {isClickable && (
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              // On desktop, move expand icon to the right for network module
              type === 'network' && 'lg:self-end'
            )}
          >
            <ChevronDown className="w-4 h-3 text-foreground-secondary" />
          </motion.div>
        )}
      </div>
      
      {/* Progress Bar (not shown for network) */}
      {showProgressBar && (
        <ProgressBar value={value} />
      )}
      
      {/* Mini sparkline preview (optional, if history is provided and not expanded) */}
      {history && history.length > 0 && !expanded && (
        <div className="mt-3 h-8 flex items-end gap-0.5">
          {history.slice(-20).map((val, idx) => {
            const height = Math.max((val / 100) * 100, 5)
            return (
              <motion.div
                key={idx}
                className={cn('flex-1 rounded-t', getProgressColor(val))}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
                style={{
                  height: `${height}%`,
                  originY: 1,
                  transformOrigin: 'bottom',
                  willChange: 'transform',
                }}
              />
            )
          })}
        </div>
      )}
    </motion.div>
  )
}, (prevProps, nextProps) => {
  // Memoization comparison - only re-render if values changed
  return (
    prevProps.type === nextProps.type &&
    prevProps.value === nextProps.value &&
    prevProps.secondaryValue === nextProps.secondaryValue &&
    prevProps.expanded === nextProps.expanded &&
    JSON.stringify(prevProps.history) === JSON.stringify(nextProps.history)
  )
})

