# Monitoring Metrics Components

This document describes the MetricModule and HistoryChart components implemented for the System Monitor platform.

## Components Overview

### MetricModule Component

**File**: `metric-module.tsx`

A reusable component that displays a single monitoring metric (CPU, Memory, Disk, Network, or Swap) with visual indicators and interactive features.

**Features**:
- Displays metric icon, label, and current value
- Shows progress bar for percentage-based metrics (CPU, Memory, Disk, Swap)
- Network metrics show upload/download speeds without progress bar
- Optional mini sparkline preview of historical data
- Clickable to expand and show detailed chart
- Smooth animations using Framer Motion
- Color-coded based on usage levels:
  - Green: 0-59% (normal)
  - Yellow: 60-79% (warning)
  - Red: 80-100% (danger)

**Props**:
```typescript
interface MetricModuleProps {
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'swap'
  value: number                    // Primary value (percentage or bytes/sec)
  secondaryValue?: number          // For network: download speed
  history?: number[]               // Historical values for sparkline
  onExpand?: () => void           // Callback when clicked
  expanded?: boolean              // Whether chart is expanded
  className?: string              // Additional CSS classes
}
```

**Usage Example**:
```tsx
<MetricModule
  type="cpu"
  value={75.5}
  history={[60, 65, 70, 75, 75.5]}
  onExpand={() => setExpandedMetric('cpu')}
  expanded={expandedMetric === 'cpu'}
/>

<MetricModule
  type="network"
  value={5000000}              // 5 MB/s upload
  secondaryValue={25000000}    // 25 MB/s download
  onExpand={() => setExpandedMetric('network')}
/>
```

### HistoryChart Component

**File**: `history-chart.tsx`

A component that displays historical trend data for monitoring metrics using Recharts library.

**Features**:
- Responsive chart sizing
- Smooth data transition animations
- Network charts display dual curves (upload + download)
- Custom tooltip with formatted values
- Time-based X-axis
- Automatic Y-axis scaling
- Color-coded lines matching theme
- Empty state handling

**Props**:
```typescript
interface HistoryChartProps {
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'swap'
  data: DynamicSystemStatus[]     // Historical status data
  className?: string              // Additional CSS classes
}
```

**Usage Example**:
```tsx
// Single metric chart
<HistoryChart
  type="cpu"
  data={historicalData}
/>

// Network chart with dual curves
<HistoryChart
  type="network"
  data={historicalData}
/>
```

## Design Requirements Fulfilled

✅ **Clickable metric modules**: Each MetricModule can be clicked to expand and show historical chart

✅ **Historical trend display**: HistoryChart component displays historical data with smooth animations

✅ **Network dual curves**: Network charts display both upload and download speed curves simultaneously

✅ **Smooth transitions**: Charts use Recharts' built-in animations for smooth data transitions

## Technical Implementation

### Libraries Used
- **Recharts**: Chart library for data visualization
- **Framer Motion**: Animation library for smooth UI transitions
- **Lucide React**: Icon library for metric icons

### Color Scheme
The components use CSS variables defined in `globals.css`:
- Primary: Blue (`--primary`)
- Success: Green (`--success`)
- Warning: Yellow (`--warning`)
- Danger: Red (`--danger`)

Colors automatically adapt to light/dark mode.

### Responsive Design
- Charts use `ResponsiveContainer` from Recharts for automatic sizing
- Components work on mobile, tablet, and desktop screens
- Grid layouts adjust based on screen size

### Animations
- Progress bars animate from 0 to target value
- Sparklines animate with staggered delays
- Chart lines use smooth easing functions
- Expand/collapse uses height animations

## Integration Example

```tsx
'use client'

import { useState } from 'react'
import { MetricModule } from '@/components/metric-module'
import { HistoryChart } from '@/components/history-chart'
import { DynamicSystemStatus } from '@/lib/api-client'

export function ClientMetrics({ data }: { data: DynamicSystemStatus[] }) {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)
  const currentStatus = data[data.length - 1]
  
  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
        <MetricModule
          type="cpu"
          value={currentStatus.cpuUsage}
          history={data.map(d => d.cpuUsage)}
          onExpand={() => setExpandedMetric('cpu')}
          expanded={expandedMetric === 'cpu'}
        />
        
        <MetricModule
          type="memory"
          value={currentStatus.memoryUsage}
          history={data.map(d => d.memoryUsage)}
          onExpand={() => setExpandedMetric('memory')}
          expanded={expandedMetric === 'memory'}
        />
        
        <MetricModule
          type="network"
          value={currentStatus.networkUpload}
          secondaryValue={currentStatus.networkDownload}
          onExpand={() => setExpandedMetric('network')}
          expanded={expandedMetric === 'network'}
        />
      </div>
      
      {/* Expanded Chart */}
      {expandedMetric && (
        <HistoryChart
          type={expandedMetric as any}
          data={data}
        />
      )}
    </div>
  )
}
```

## Testing

A demo component (`metric-demo.tsx`) is provided to showcase the functionality with sample data. It demonstrates:
- All five metric types
- Interactive expand/collapse
- Network chart with dual curves
- Responsive layout
- Animation effects

## Future Enhancements

Potential improvements for future iterations:
- Configurable time ranges for charts
- Export chart data to CSV
- Zoom and pan functionality
- Real-time data streaming
- Alert threshold indicators
- Comparison mode for multiple clients
