/**
 * @pattern Observer Pattern + Singleton Pattern
 * @category Behavioral
 * @purpose Centralized navigation state management with reactive updates
 *
 * @example
 * ```typescript
 * const { navigationItems, isActive } = useNavigation()
 * ```
 */

import { computed } from 'vue'
import { Home, Package, FileText, Info, Link, Settings } from 'lucide-vue-next'
import type { NavigationItem } from '~/types/navigation'

/**
 * Navigation composable - Singleton pattern for global navigation state
 */
export function useNavigation() {
  const route = useRoute()

  /**
   * Navigation items configuration
   * Pattern: Factory Pattern for creating navigation items
   */
  const navigationItems = computed<NavigationItem[]>(() => [
    {
      title: 'Accueil',
      path: '/',
      icon: Home,
      isActive: route.path === '/'
    },
    {
      title: 'Produits',
      path: '/products',
      icon: Package,
      isActive: route.path === '/products'
    },
    {
      title: 'Pages',
      path: '/pages',
      icon: FileText,
      isActive: route.path === '/pages'
    },
    {
      title: 'À propos',
      path: '/about',
      icon: Info,
      isActive: route.path === '/about'
    },
    {
      title: 'Contact & Réseaux',
      path: '/contact-links',
      icon: Link,
      isActive: route.path === '/contact-links'
    },
    {
      title: 'Paramètres',
      path: '/settings/credentials',
      icon: Settings,
      isActive: route.path.startsWith('/settings')
    }
  ])

  /**
   * Check if a path is active
   * Pure function for route matching
   */
  const isActive = (path: string): boolean => {
    return route.path === path
  }

  /**
   * Get current page title based on route
   * Pure function for title derivation
   */
  const currentPageTitle = computed<string>(() => {
    const currentItem = navigationItems.value.find(item => item.isActive)
    return currentItem?.title || 'Tableau de bord'
  })

  return {
    navigationItems,
    isActive,
    currentPageTitle
  }
}
