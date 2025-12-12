'use client'

/**
 * Example usage of TagFilter and GroupView components
 * This demonstrates how to use the tag filtering and grouping functionality
 */

import { useState } from 'react'
import { TagFilter } from './tag-filter'
import { GroupView } from './group-view'
import { ClientSummary } from '@/lib/api-client'

// Mock data for demonstration
const mockClients: ClientSummary[] = [
  {
    clientId: '1',
    clientName: 'Web Server 1',
    clientTags: ['production', 'web', 'nginx'],
    clientPurpose: 'Production web server',
    hostname: 'web-01',
    platform: 'linux',
    status: 'online',
    lastUpdate: Date.now() - 60000,
  },
  {
    clientId: '2',
    clientName: 'Database Server',
    clientTags: ['production', 'database', 'postgresql'],
    clientPurpose: 'Primary database server',
    hostname: 'db-01',
    platform: 'linux',
    status: 'online',
    lastUpdate: Date.now() - 120000,
  },
  {
    clientId: '3',
    clientName: 'Dev Machine',
    clientTags: ['development', 'testing'],
    clientPurpose: 'Development and testing',
    hostname: 'dev-01',
    platform: 'darwin',
    status: 'online',
    lastUpdate: Date.now() - 30000,
  },
  {
    clientId: '4',
    clientName: 'Windows Server',
    clientTags: ['production', 'windows', 'iis'],
    clientPurpose: 'Windows application server',
    hostname: 'win-01',
    platform: 'win32',
    status: 'offline',
    lastUpdate: Date.now() - 600000,
  },
]

export function TagFilterExample() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [groupBy, setGroupBy] = useState<'tags' | 'purpose' | 'platform'>('tags')

  // Extract all unique tags from clients
  const allTags = Array.from(
    new Set(mockClients.flatMap(client => client.clientTags || []))
  ).sort()

  // Filter clients based on selected tags
  const filteredClients = selectedTags.length === 0
    ? mockClients
    : mockClients.filter(client =>
        client.clientTags?.some(tag => selectedTags.includes(tag))
      )

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Tag and Grouping Examples</h2>
        
        {/* Tag Filter */}
        <div className="p-4 bg-card rounded-lg border border-border">
          <TagFilter
            tags={allTags}
            selectedTags={selectedTags}
            onTagSelect={setSelectedTags}
          />
        </div>

        {/* Group By Selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground-secondary">
            Group By:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setGroupBy('tags')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                groupBy === 'tags'
                  ? 'bg-primary text-white'
                  : 'bg-card text-foreground border border-border hover:border-primary/50'
              }`}
            >
              By Tags
            </button>
            <button
              onClick={() => setGroupBy('purpose')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                groupBy === 'purpose'
                  ? 'bg-primary text-white'
                  : 'bg-card text-foreground border border-border hover:border-primary/50'
              }`}
            >
              By Purpose
            </button>
            <button
              onClick={() => setGroupBy('platform')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                groupBy === 'platform'
                  ? 'bg-primary text-white'
                  : 'bg-card text-foreground border border-border hover:border-primary/50'
              }`}
            >
              By Platform
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-foreground-secondary">
          Showing {filteredClients.length} / {mockClients.length} clients
        </div>
      </div>

      {/* Group View */}
      <GroupView
        clients={filteredClients}
        groupBy={groupBy}
        onClientClick={(clientId) => console.log('Clicked client:', clientId)}
      />
    </div>
  )
}





