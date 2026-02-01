/**
 * Navigation composable
 * Centralizes navigation configuration using Strategy Pattern for future extensibility
 * (e.g., different navigation structures for different user roles or locales)
 */

import type { NavigationItem } from '~/types/navigation'

/**
 * Returns the main navigation items for the application
 * Pure function - always returns the same configuration
 */
export const useNavigation = () => {
  const navigationItems = computed<NavigationItem[]>(() => [
    {
      label: 'Home',
      path: '/',
      ariaLabel: 'Navigate to home page'
    },
    {
      label: 'Wall Hanging',
      path: '/wall-hanging',
      ariaLabel: 'Browse wall hanging collection'
    },
    {
      label: 'Rugs',
      path: '/rugs',
      ariaLabel: 'Browse rugs collection'
    },
    {
      label: 'About',
      path: '/about',
      ariaLabel: 'Learn more about Atelier Kaisla'
    },
    {
      label: 'Blog',
      path: '/blog',
      ariaLabel: 'Read our blog articles'
    }
  ])

  return {
    navigationItems
  }
}
