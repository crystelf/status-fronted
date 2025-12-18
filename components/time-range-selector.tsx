'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TimeRangeSelectorProps {
  availableTimeRanges: Array<{ value: string; label: string }>;
  selectedRange: string;
  onRangeChange: (range: string) => void;
  clientId: string | null;
}

/**
 * TimeRangeSelector Component
 * Dropdown selector for time ranges with smooth animations
 */
export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  availableTimeRanges,
  selectedRange,
  onRangeChange,
  clientId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown when clientId changes
  useEffect(() => {
    setIsOpen(false);
  }, [clientId]);

  // Handle range selection
  const handleSelect = (range: string) => {
    onRangeChange(range);
    setIsOpen(false);
  };

  return (
    <div className="relative min-w-[120px]" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-card hover:border-primary/50 transition-all duration-200 flex items-center justify-between"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {availableTimeRanges.find(range => range.value === selectedRange)?.label || '选择时间范围'}
        <motion.svg 
          className="w-4 h-4 opacity-50" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
              duration: 0.2,
              ease: [0.6, -0.05, 0.01, 0.99]
            }}
          >
            {availableTimeRanges.map((range) => (
              <motion.button
                key={range.value}
                onClick={() => handleSelect(range.value)}
                className={`w-full px-4 py-2 text-sm text-left transition-all duration-200 ${selectedRange === range.value ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-background-secondary'}`}
                whileHover={{ 
                  backgroundColor: selectedRange === range.value ? 'rgb(var(--primary)/10)' : 'rgb(var(--background-secondary))',
                  x: 4
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: availableTimeRanges.indexOf(range) * 0.03,
                  duration: 0.2
                }}
              >
                {range.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
