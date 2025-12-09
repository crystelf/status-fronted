/**
 * Animation configuration for optimal performance
 * Uses GPU-accelerated properties and prevents layout thrashing
 * Requirements: 9.6, 9.7
 */

import { Transition, Variants } from 'framer-motion'

/**
 * GPU-accelerated transition configuration
 * Uses transform and opacity which trigger GPU acceleration
 */
export const smoothTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8,
}

export const fastTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
  mass: 0.5,
}

export const easeTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
}

/**
 * Card entrance animation variants
 * Uses transform (translateY) and opacity for GPU acceleration
 */
export const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: (index: number = 0) => ({ 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      ...smoothTransition,
      delay: index * 0.03, // Reduced stagger for better performance
    }
  }),
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: fastTransition,
  }
}

/**
 * Tap/click animation
 * Uses scale transform for GPU acceleration
 */
export const tapAnimation = {
  scale: 0.98,
  transition: { 
    duration: 0.1,
    ease: 'easeOut',
  }
}

/**
 * Hover animation
 * Uses scale transform for GPU acceleration
 */
export const hoverAnimation = {
  scale: 1.02,
  transition: smoothTransition,
}

/**
 * Fade in/out variants
 * Uses opacity only for maximum performance
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: easeTransition,
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 },
  }
}

/**
 * Slide variants for panels and modals
 * Uses transform (translateX/Y) for GPU acceleration
 */
export const slideVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: smoothTransition,
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: fastTransition,
  }
}

/**
 * Expand/collapse variants for detail sections
 * Uses height with overflow hidden to prevent layout shift
 */
export const expandVariants: Variants = {
  collapsed: { 
    height: 0,
    opacity: 0,
    transition: fastTransition,
  },
  expanded: { 
    height: 'auto',
    opacity: 1,
    transition: smoothTransition,
  }
}

/**
 * Progress bar animation
 * Uses scaleX transform for GPU acceleration
 */
export const progressVariants: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: (width: number) => ({
    scaleX: width / 100,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    }
  })
}

/**
 * Stagger children animation configuration
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  }
}

/**
 * Layout animation configuration
 * Prevents layout thrashing by using transform
 */
export const layoutTransition: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 30,
}

/**
 * Reduced motion configuration for accessibility
 * Respects user's prefers-reduced-motion setting
 */
export function getReducedMotionConfig() {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get transition based on reduced motion preference
 */
export function getAccessibleTransition(transition: Transition = smoothTransition): Transition {
  if (getReducedMotionConfig()) {
    return { duration: 0.01 }
  }
  return transition
}
