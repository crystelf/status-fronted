import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import React from 'react';

export const metadata: Metadata = {
  title: 'System Monitor',
  description: 'Real-time system monitoring dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="system-monitor-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
