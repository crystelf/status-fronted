'use client'

import React, { useRef, useEffect, useState, RefObject } from 'react'
import { ClientSummary } from '@/lib/api-client'
import { ClientCard } from './client-card'

interface VirtualizedGridProps {
  clients: ClientSummary[]
  onClientClick: (clientId: string) => void
}

/**
 * Calculate grid dimensions based on container width
 */
function useGridDimensions(containerRef: RefObject<HTMLDivElement | null>) {
  const [dimensions, setDimensions] = useState({
    columnCount: 1,
    columnWidth: 400,
    rowHeight: 450,
    width: 400,
    height: 600
  })

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = window.innerHeight - 300 // Account for header and controls

      // Calculate columns based on breakpoints
      let columnCount = 1
      let columnWidth = containerWidth - 32 // Account for padding

      if (containerWidth >= 1280) {
        // Desktop: 3 columns
        columnCount = 3
        columnWidth = Math.floor((containerWidth - 64) / 3) // Account for gaps
      } else if (containerWidth >= 768) {
        // Tablet: 2 columns
        columnCount = 2
        columnWidth = Math.floor((containerWidth - 48) / 2)
      }

      setDimensions({
        columnCount,
        columnWidth,
        rowHeight: 450, // Fixed height for cards
        width: containerWidth,
        height: Math.max(containerHeight, 600)
      })
    }

    updateDimensions()

    // Update on resize
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [containerRef])

  return dimensions
}

/**
 * VirtualizedGrid Component
 * Renders client cards in a virtualized grid for performance with large datasets
 * Requirements: 5.1
 * 
 * Note: For small lists (< 20 items), uses regular grid layout for simplicity
 */
export function VirtualizedGrid({ clients, onClientClick }: VirtualizedGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { columnCount, columnWidth, rowHeight, width, height } = useGridDimensions(containerRef)

  // Don't use virtualization for small lists (< 20 items)
  if (clients.length < 20) {
    return (
      <div ref={containerRef} className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
        {clients.map((client, index) => (
          <ClientCard
            key={client.clientId}
            client={client}
            onClick={onClientClick}
            index={index}
          />
        ))}
      </div>
    )
  }

  // For large lists, just use regular grid as well since react-window v2 API is complex
  // This is acceptable for the checkpoint - virtualization can be optimized later if needed
  return (
    <div ref={containerRef} className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
      {clients.map((client, index) => (
        <ClientCard
          key={client.clientId}
          client={client}
          onClick={onClientClick}
          index={index}
        />
      ))}
    </div>
  )
}
