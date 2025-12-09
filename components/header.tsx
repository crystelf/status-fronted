'use client'

import { Container } from './container'
import { ThemeToggle } from './theme-toggle'
import { Monitor } from 'lucide-react'

interface HeaderProps {
  title?: string
}

/**
 * Responsive header component
 * Adapts layout based on screen size
 */
export function Header({ title = 'System Monitor' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <Monitor className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold mobile:text-lg">
              {title}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </Container>
    </header>
  )
}
