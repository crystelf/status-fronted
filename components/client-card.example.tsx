'use client';

/**
 * Example usage of ClientCard component
 * This file demonstrates how to use the ClientCard with mock data
 */

import { ClientCard } from './client-card';
import { ClientSummary, ClientDetail } from '@/lib/api-client';

// Mock data for demonstration
const mockClientSummary: ClientSummary = {
  clientId: '123e4567-e89b-12d3-a456-426614174000',
  clientName: 'Web服务器-01',
  clientTags: ['生产环境', 'Web服务器', '北京'],
  clientPurpose: '主要Web应用服务器，处理用户请求',
  hostname: 'web-server-01',
  platform: 'linux',
  status: 'online',
  lastUpdate: Date.now() - 120000, // 2 minutes ago
};

const mockClientDetail: ClientDetail = {
  ...mockClientSummary,
  staticInfo: {
    cpuModel: 'Intel Core i7-9700K',
    cpuCores: 8,
    cpuArch: 'x86_64',
    systemVersion: 'Ubuntu 22.04 LTS',
    systemModel: 'Dell PowerEdge R740',
    totalMemory: 34359738368, // 32 GB
    totalSwap: 8589934592, // 8 GB
    totalDisk: 1099511627776, // 1 TB
    disks: [
      {
        device: '/dev/sda',
        size: 1099511627776,
        type: 'SSD',
        interfaceType: 'NVMe',
      }
    ],
    location: '北京, 中国',
  },
  currentStatus: {
    cpuUsage: 45.2,
    cpuFrequency: 3.6,
    memoryUsage: 62.8,
    swapUsage: 12.5,
    diskUsage: 38.4,
    networkUpload: 5242880, // 5 MB/s
    networkDownload: 10485760, // 10 MB/s
    diskUsages: [
      {
        device: '/dev/sda1',
        size: 1099511627776,
        used: 422212565068,
        available: 677299062708,
        usagePercent: 38.4,
        mountpoint: '/',
      }
    ],
    timestamp: Date.now(),
  },
};

const mockOfflineClient: ClientDetail = {
  clientId: '223e4567-e89b-12d3-a456-426614174001',
  clientName: '数据库服务器-02',
  clientTags: ['生产环境', '数据库'],
  clientPurpose: 'MySQL主数据库',
  hostname: 'db-server-02',
  platform: 'windows',
  status: 'offline',
  lastUpdate: Date.now() - 3600000, // 1 hour ago
  staticInfo: {
    cpuModel: 'AMD EPYC 7742',
    cpuCores: 64,
    cpuArch: 'x86_64',
    systemVersion: 'Windows Server 2022',
    systemModel: 'HP ProLiant DL385',
    totalMemory: 137438953472, // 128 GB
    totalSwap: 17179869184, // 16 GB
    totalDisk: 2199023255552, // 2 TB
    disks: [
      {
        device: 'C:',
        size: 1099511627776,
        type: 'NVMe',
        interfaceType: 'NVMe',
      },
      {
        device: 'D:',
        size: 1099511627776,
        type: 'NVMe',
        interfaceType: 'NVMe',
      }
    ],
    location: '上海, 中国',
  },
  currentStatus: {
    cpuUsage: 0,
    cpuFrequency: 0,
    memoryUsage: 0,
    swapUsage: 0,
    diskUsage: 0,
    networkUpload: 0,
    networkDownload: 0,
    diskUsages: [
      {
        device: 'C:',
        size: 1099511627776,
        used: 549755813888,
        available: 549755813888,
        usagePercent: 50,
        mountpoint: 'C:',
      },
      {
        device: 'D:',
        size: 1099511627776,
        used: 219902325555,
        available: 879609302221,
        usagePercent: 20,
        mountpoint: 'D:',
      }
    ],
    timestamp: Date.now() - 3600000,
  },
};

const mockMacClient: ClientDetail = {
  clientId: '323e4567-e89b-12d3-a456-426614174002',
  clientName: '开发机-MacBook',
  clientTags: ['开发环境', 'macOS'],
  clientPurpose: '前端开发工作站',
  hostname: 'macbook-pro-dev',
  platform: 'darwin',
  status: 'online',
  lastUpdate: Date.now() - 30000, // 30 seconds ago
  staticInfo: {
    cpuModel: 'Apple M2 Pro',
    cpuCores: 12,
    cpuArch: 'arm64',
    systemVersion: 'macOS 14.0 Sonoma',
    systemModel: 'MacBook Pro 16-inch 2023',
    totalMemory: 34359738368, // 32 GB
    totalSwap: 0,
    totalDisk: 1099511627776, // 1 TB
    disks: [
      {
        device: '/dev/disk1',
        size: 1099511627776,
        type: 'SSD',
        interfaceType: 'NVMe',
      }
    ],
    location: '深圳, 中国',
  },
  currentStatus: {
    cpuUsage: 25.6,
    cpuFrequency: 3.5,
    memoryUsage: 48.3,
    swapUsage: 0,
    diskUsage: 55.2,
    networkUpload: 1048576, // 1 MB/s
    networkDownload: 2097152, // 2 MB/s
    diskUsages: [
      {
        device: '/dev/disk1s1',
        size: 1099511627776,
        used: 605508094468,
        available: 493003532308,
        usagePercent: 55.2,
        mountpoint: '/',
      }
    ],
    timestamp: Date.now(),
  },
};

/**
 * Example component showing ClientCard usage
 */
export function ClientCardExample() {
  const handleCardClick = (clientId: string) => {
    console.log('Card clicked:', clientId);
    alert(`Clicked client: ${clientId}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">ClientCard Examples</h2>
        <p className="text-foreground-secondary mb-6">Display client cards with different statuses and platforms</p>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
        <ClientCard client={mockClientDetail} onClick={handleCardClick} index={0} />
        <ClientCard client={mockOfflineClient} onClick={handleCardClick} index={1} />
        <ClientCard client={mockMacClient} onClick={handleCardClick} index={2} />
      </div>

      {/* Summary card without detailed info */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Simplified Card</h3>
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
          <ClientCard client={mockClientSummary} onClick={handleCardClick} index={0} />
        </div>
      </div>
    </div>
  );
}


