/**
 * Navigation utility functions
 * Pure functions for navigation-related operations
 */

import type { NavigationItem } from '~/types/navigation'

/**
 * Filter navigation items by a predicate function
 * Higher-order function demonstrating functional programming
 *
 * @param items - Array of navigation items
 * @param predicate - Filter function
 * @returns Filtered array of navigation items
 */
export const filterNavigationItems = (
  items: NavigationItem[],
  predicate: (item: NavigationItem) => boolean
): NavigationItem[] => {
  return items.filter(predicate)
}

/**
 * Find navigation item by path
 * Pure function - no side effects
 *
 * @param items - Array of navigation items
 * @param path - Path to search for
 * @returns Navigation item or undefined
 */
export const findNavigationItemByPath = (
  items: NavigationItem[],
  path: string
): NavigationItem | undefined => {
  return items.find(item => item.path === path)
}

/**
 * Check if a path matches a route
 * Handles exact matches and path prefixes
 *
 * @param routePath - Current route path
 * @param itemPath - Navigation item path
 * @returns Boolean indicating if paths match
 */
export const isPathActive = (routePath: string, itemPath: string): boolean => {
  if (itemPath === '/') {
    return routePath === '/'
  }
  return routePath.startsWith(itemPath)
}

/**
 * Transform navigation items to include additional properties
 * Example of function composition and mapping
 *
 * @param items - Array of navigation items
 * @param transform - Transformation function
 * @returns Transformed array
 */
export const transformNavigationItems = <T>(
  items: NavigationItem[],
  transform: (item: NavigationItem) => T
): T[] => {
  return items.map(transform)
}

/**
 * Get breadcrumb trail from current path
 * Useful for generating breadcrumb navigation
 *
 * @param items - Array of navigation items
 * @param currentPath - Current route path
 * @returns Array of navigation items representing the breadcrumb trail
 */
export const getBreadcrumbTrail = (
  items: NavigationItem[],
  currentPath: string
): NavigationItem[] => {
  const trail: NavigationItem[] = []

  // Always include home
  const home = items.find(item => item.path === '/')
  if (home) {
    trail.push(home)
  }

  // Add current page if not home
  if (currentPath !== '/') {
    const currentItem = items.find(item => item.path === currentPath)
    if (currentItem) {
      trail.push(currentItem)
    }
  }

  return trail
}
