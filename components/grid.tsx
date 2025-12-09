import { cn } from '@/lib/utils'

interface GridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: number
}

/**
 * Responsive grid component
 * Automatically adjusts columns based on breakpoints
 */
export function Grid({ 
  children, 
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4
}: GridProps) {
  const gridCols = {
    mobile: `grid-cols-${cols.mobile || 1}`,
    tablet: `tablet:grid-cols-${cols.tablet || 2}`,
    desktop: `desktop:grid-cols-${cols.desktop || 3}`,
  }

  return (
    <div
      className={cn(
        'grid',
        gridCols.mobile,
        gridCols.tablet,
        gridCols.desktop,
        `gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  )
}
