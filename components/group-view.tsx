'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Layers } from 'lucide-react';
import { useState } from 'react';
import { ClientSummary } from '@/lib/api-client';
import { ClientCard } from './client-card';
import { cn } from '@/lib/utils';

interface GroupViewProps {
  clients: ClientSummary[];
  groupBy: 'tags' | 'purpose' | 'platform';
  onClientClick?: (clientId: string) => void;
}

/**
 * Group clients by the specified criteria
 */
function groupClients(
  clients: ClientSummary[],
  groupBy: 'tags' | 'purpose' | 'platform'
): Map<string, ClientSummary[]> {
  const groups = new Map<string, ClientSummary[]>();

  clients.forEach((client) => {
    if (groupBy === 'tags') {
      // Group by tags - a client can appear in multiple groups
      if (client.clientTags && client.clientTags.length > 0) {
        client.clientTags.forEach((tag) => {
          if (!groups.has(tag)) {
            groups.set(tag, []);
          }
          groups.get(tag)!.push(client);
        });
      } else {
        // Clients without tags go to "Uncategorized"
        const noTagKey = 'Uncategorized';
        if (!groups.has(noTagKey)) {
          groups.set(noTagKey, []);
        }
        groups.get(noTagKey)!.push(client);
      }
    } else if (groupBy === 'purpose') {
      // Group by purpose
      const purpose = client.clientPurpose || 'Unspecified Purpose';
      if (!groups.has(purpose)) {
        groups.set(purpose, []);
      }
      groups.get(purpose)!.push(client);
    } else if (groupBy === 'platform') {
      // Group by platform
      const platform = client.platform || 'unknown';
      if (!groups.has(platform)) {
        groups.set(platform, []);
      }
      groups.get(platform)!.push(client);
    }
  });

  return groups;
}

/**
 * Get display name for platform
 */
function getPlatformDisplayName(platform: string): string {
  const platformLower = platform.toLowerCase();

  if (platformLower.includes('windows') || platformLower === 'win32') {
    return 'Windows';
  } else if (platformLower.includes('linux')) {
    return 'Linux';
  } else if (platformLower.includes('darwin') || platformLower.includes('mac')) {
    return 'macOS';
  }

  return platform;
}

/**
 * GroupSection Component
 * Displays a collapsible group of clients
 */
function GroupSection({ groupName,
clients,
groupBy,
onClientClick,
index }: {
  groupName: string,
  clients: ClientSummary[],
  groupBy: 'tags' | 'purpose' | 'platform',
  onClientClick?: (clientId: string) => void,
  index: number
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const displayName = groupBy === 'platform' ? getPlatformDisplayName(groupName) : groupName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: 'easeOut',
      }}
      className="space-y-4"
    >
      {/* Group Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between p-4 rounded-lg',
          'bg-card border border-border',
          'hover:bg-card-hover transition-colors duration-200',
          'group'
        )}
      >
        <div className="flex items-center gap-3">
          <motion.div animate={{ rotate: isExpanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-foreground-secondary" />
          </motion.div>

          <Layers className="w-5 h-5 text-primary" />

          <div className="text-left">
            <h3 className="text-lg font-semibold">{displayName}</h3>
            <p className="text-sm text-foreground-secondary">{clients.length} clients</p>
          </div>
        </div>

        <div
          className={cn('px-3 py-1 rounded-full text-sm font-medium', 'bg-primary/10 text-primary')}
        >
          {clients.length}
        </div>
      </button>

      {/* Group Content */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4 pl-4">
          {clients.map((client, clientIndex) => (
            <ClientCard
              key={client.clientId}
              client={client}
              onClick={onClientClick}
              index={clientIndex}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * GroupView Component
 * Displays clients grouped by tags, purpose, or platform
 */
export function GroupView({ clients, groupBy, onClientClick }: GroupViewProps) {
  const groups = groupClients(clients, groupBy);

  // Sort groups by name
  const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
    if (a[0].startsWith('未')) return 1;
    if (b[0].startsWith('未')) return -1;
    return a[0].localeCompare(b[0], 'zh-CN');
  });

  if (sortedGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground-secondary">No client data at the moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedGroups.map(([groupName, groupClients], index) => (
        <GroupSection
          key={groupName}
          groupName={groupName}
          clients={groupClients}
          groupBy={groupBy}
          onClientClick={onClientClick}
          index={index}
        />
      ))}
    </div>
  );
}




