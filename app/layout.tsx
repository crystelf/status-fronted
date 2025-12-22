import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { FaviconManager } from '@/components/favicon-manager'
import React from 'react';

export const metadata: Metadata = {
  title: 'System Monitor',
  description: 'Real-time system monitoring dashboard',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storageKey = 'system-monitor-theme';
                  var theme = localStorage.getItem(storageKey);
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                  var d = document.documentElement;
                  d.classList.remove('light', 'dark');
                  if (!theme || theme === 'system') {
                    if (supportDarkMode) {
                      d.classList.add('dark');
                    } else {
                      d.classList.add('light');
                    }
                  } else {
                    d.classList.add(theme);
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="system-monitor-theme">
          <FaviconManager />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
