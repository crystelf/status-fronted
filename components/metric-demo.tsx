'use client';

import { useState } from 'react';
import { MetricModule } from './metric-module';
import { HistoryChart } from './history-chart';
import { DynamicSystemStatus } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Demo component to showcase MetricModule and HistoryChart
 * This is for testing and demonstration purposes
 */
export function MetricDemo() {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  // Sample data for demonstration
  const sampleData: DynamicSystemStatus[] = Array.from({ length: 20 }, (_, i) => ({
    cpuUsage: 40 + Math.random() * 40,
    cpuFrequency: 2.4 + Math.random() * 0.8,
    memoryUsage: 50 + Math.random() * 30,
    swapUsage: 10 + Math.random() * 20,
    diskUsage: 30 + Math.random() * 20,
    networkUpload: Math.random() * 10000000, // 0-10MB/s
    networkDownload: Math.random() * 50000000, // 0-50MB/s
    timestamp: Date.now() - (20 - i) * 60000, // Last 20 minutes
  }));

  const currentStatus = sampleData[sampleData.length - 1];

  const handleExpand = (metric: string) => {
    setExpandedMetric(expandedMetric === metric ? null : metric);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Monitoring Metrics Demo</h2>
        <p className="text-foreground-secondary mb-6">Click any metric card to view historical trend charts</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
        <MetricModule
          type="cpu"
          value={currentStatus.cpuUsage}
          history={sampleData.map((d) => d.cpuUsage)}
          onExpand={() => handleExpand('cpu')}
          expanded={expandedMetric === 'cpu'}
        />

        <MetricModule
          type="memory"
          value={currentStatus.memoryUsage}
          history={sampleData.map((d) => d.memoryUsage)}
          onExpand={() => handleExpand('memory')}
          expanded={expandedMetric === 'memory'}
        />

        <MetricModule
          type="disk"
          value={currentStatus.diskUsage}
          history={sampleData.map((d) => d.diskUsage)}
          onExpand={() => handleExpand('disk')}
          expanded={expandedMetric === 'disk'}
        />

        <MetricModule
          type="network"
          value={currentStatus.networkUpload}
          secondaryValue={currentStatus.networkDownload}
          onExpand={() => handleExpand('network')}
          expanded={expandedMetric === 'network'}
        />

        <MetricModule
          type="swap"
          value={currentStatus.swapUsage}
          history={sampleData.map((d) => d.swapUsage)}
          onExpand={() => handleExpand('swap')}
          expanded={expandedMetric === 'swap'}
        />
      </div>

      {/* Expanded Chart */}
      <AnimatePresence>
        {expandedMetric && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HistoryChart type={expandedMetric as any} data={sampleData} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Network Chart (Default Display) */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Network Chart</h3>
        <HistoryChart type="network" data={sampleData} />
      </div>
    </div>
  );
}