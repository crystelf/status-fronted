import { cn } from '@/lib/utils'
import React from 'react';

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

/**
 * Responsive container component
 * Provides consistent padding and max-width across breakpoints
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto',
        'px-4 mobile:px-4',
        'tablet:px-6',
        'desktop:px-8',
        'max-w-7xl',
        className
      )}
    >
      {children}
    </div>
  )
}
