'use client';

import { useEffect, useState } from 'react';
import { useTheme } from './theme-provider';

/**
 * Dynamic favicon component that changes color based on theme and network status
 */
export function FaviconManager() {
  const { theme } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Listen for network status changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Generate favicon based on theme and network status
  useEffect(() => {
    // Determine current theme (light/dark)
    const isDarkMode = theme === 'dark' || 
                      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Determine color based on theme and network status
    let fillColor;
    if (!isOnline) {
      fillColor = '#9CA3AF'; // Gray for offline
    } else if (isDarkMode) {
      fillColor = '#60A5FA'; // Light blue for dark mode
    } else {
      fillColor = '#2563EB'; // Dark blue for light mode
    }

    // SVG content with dynamic fill color
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
        <path 
          fill="${fillColor}" 
          fill-rule="evenodd" 
          d="M7.999 1a.75.75 0 0 1 .715.521L12 11.79l1.286-4.018A.75.75 0 0 1 14 7.25h1.25a.75.75 0 0 1 0 1.5h-.703l-1.833 5.729a.75.75 0 0 1-1.428 0L8.005 4.226l-2.29 7.25a.75.75 0 0 1-1.42.03L3.031 8.03l-.07.208a.75.75 0 0 1-.711.513H.75a.75.75 0 0 1 0-1.5h.96l.578-1.737a.75.75 0 0 1 1.417-.02L4.95 8.919l2.335-7.394A.75.75 0 0 1 7.999 1" 
          clip-rule="evenodd"
        />
      </svg>
    `;

    // Create data URL from SVG content
    const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;

    // Update favicon
    const favicon = document.querySelector('link[rel*="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = dataUrl;
    }

    // Update apple touch icon
    const appleIcon = document.querySelector('link[rel*="apple-touch-icon"]') as HTMLLinkElement;
    if (appleIcon) {
      appleIcon.href = dataUrl;
    }
  }, [theme, isOnline]);

  return null;
}