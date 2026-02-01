/**
 * Type definitions for navigation system
 * Ensures type safety across the application
 */

export interface NavigationItem {
  label: string
  path: string
  ariaLabel: string
}

export type NavigationItems = NavigationItem[]
