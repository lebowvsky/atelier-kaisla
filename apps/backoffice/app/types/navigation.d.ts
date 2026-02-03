/**
 * @pattern Type Definitions
 * @category Structural
 * @purpose Type safety for navigation system
 */

import type { Component } from 'vue'

/**
 * Navigation item configuration
 */
export interface NavigationItem {
  /** Display text for the navigation item */
  title: string
  /** Route path (Nuxt route) */
  path: string
  /** Lucide icon component name */
  icon: Component
  /** Optional badge or count */
  badge?: string | number
  /** Whether the item is active */
  isActive?: boolean
}

/**
 * Sidebar state
 */
export interface SidebarState {
  /** Whether sidebar is open on mobile */
  isOpen: boolean
  /** Whether sidebar is collapsed on desktop */
  isCollapsed: boolean
}
