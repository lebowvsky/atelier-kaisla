<script setup lang="ts">
/**
 * AppNavbar Component
 *
 * A responsive, accessible navigation bar implementing:
 * - Observer Pattern: Reactive state for mobile menu visibility
 * - Strategy Pattern: Navigation items configured via composable
 * - Functional Programming: Pure functions, immutable data
 *
 * SEO Considerations:
 * - Semantic HTML5 <nav> element
 * - Proper heading hierarchy (logo wrapped in h1 on home, div otherwise)
 * - Accessible ARIA labels and keyboard navigation
 * - NuxtLink for SPA navigation with SEO benefits
 */

import type { NavigationItem } from '~/types/navigation'

// Navigation configuration
const { navigationItems } = useNavigation()

// Router for active state detection
const route = useRoute()

// Mobile menu state (Observer Pattern - reactive state management)
const isMobileMenuOpen = ref(false)

/**
 * Toggle mobile menu visibility
 * Pure function with side effect on reactive state
 */
const toggleMobileMenu = (): void => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

/**
 * Close mobile menu
 * Used when clicking navigation items or outside menu
 */
const closeMobileMenu = (): void => {
  isMobileMenuOpen.value = false
}

/**
 * Check if a navigation item is currently active
 * Pure function - same input always produces same output
 */
const isActiveRoute = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

/**
 * Generate CSS classes for navigation items
 * Pure function using functional composition
 */
const getNavItemClasses = (item: NavigationItem): string => {
  const baseClasses = 'nav-link'
  const activeClass = isActiveRoute(item.path) ? 'nav-link--active' : ''
  return [baseClasses, activeClass].filter(Boolean).join(' ')
}

// SEO: Dynamic meta tags for the navbar (inheritable by child pages)
useSeoMeta({
  ogSiteName: 'Atelier Kaisla',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="navbar__container">
      <!-- Logo Section -->
      <div class="navbar__logo">
        <NuxtLink
          to="/"
          class="logo-link"
          aria-label="Atelier Kaisla - Return to home page"
          @click="closeMobileMenu"
        >
          <NuxtImg
            src="/logo-kaisla.png"
            alt="Atelier Kaisla Logo"
            class="logo-image"
            width="180"
            height="240"
            loading="eager"
            fetchpriority="high"
            preload
            format="webp"
          />
        </NuxtLink>
      </div>

      <!-- Desktop Navigation -->
      <div class="navbar__menu navbar__menu--desktop">
        <ul class="nav-list" role="menubar">
          <li
            v-for="item in navigationItems"
            :key="item.path"
            role="none"
          >
            <NuxtLink
              :to="item.path"
              :class="getNavItemClasses(item)"
              :aria-label="item.ariaLabel"
              :aria-current="isActiveRoute(item.path) ? 'page' : undefined"
              role="menuitem"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Mobile Menu Toggle -->
      <button
        class="navbar__toggle"
        :class="{ 'navbar__toggle--active': isMobileMenuOpen }"
        aria-label="Toggle mobile navigation menu"
        :aria-expanded="isMobileMenuOpen"
        aria-controls="mobile-menu"
        @click="toggleMobileMenu"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>

    <!-- Mobile Navigation -->
    <Transition name="slide-fade">
      <div
        v-if="isMobileMenuOpen"
        id="mobile-menu"
        class="navbar__menu navbar__menu--mobile"
      >
        <ul class="nav-list nav-list--mobile" role="menu">
          <li
            v-for="item in navigationItems"
            :key="`mobile-${item.path}`"
            role="none"
          >
            <NuxtLink
              :to="item.path"
              :class="getNavItemClasses(item)"
              :aria-label="item.ariaLabel"
              :aria-current="isActiveRoute(item.path) ? 'page' : undefined"
              role="menuitem"
              @click="closeMobileMenu"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </Transition>
  </nav>
</template>

<style lang="scss" scoped>
.navbar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: $color-canvas;
  border-bottom: 1px solid $color-line;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
}

.navbar__container {
  @include container;
  padding: $spacing-sm $spacing-md;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar__logo {
  flex-shrink: 0;
}

.logo-link {
  display: block;
  line-height: 0;

  @media (prefers-reduced-motion: no-preference) {
    transition: opacity $transition-fast;
  }

  &:hover {
    opacity: 0.8;
  }

  &:focus-visible {
    outline: 2px solid $color-fjord-deep;
    outline-offset: 2px;
  }
}

.logo-image {
  height: 50px;
  width: auto;
  display: block;
}

.navbar__menu--desktop {
  display: none;
}

.nav-list {
  display: flex;
  gap: $spacing-lg;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  position: relative;
  display: inline-block;
  color: $color-ink-soft;
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: $font-weight-medium;
  letter-spacing: 0.025em;
  padding: $spacing-xs 0;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: $color-ink;

    @media (prefers-reduced-motion: no-preference) {
      transition: width $transition-base;
    }
  }

  &:hover {
    // No color-shift — keep underline animation only.
    &::after {
      width: 100%;
    }
  }

  &:focus-visible {
    outline: 2px solid $color-fjord-deep;
    outline-offset: 4px;
  }

  &--active {
    color: $color-ink;
    font-weight: $font-weight-semibold;

    &::after {
      width: 100%;
    }
  }
}

.navbar__toggle {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;

  @media (prefers-reduced-motion: no-preference) {
    transition: transform $transition-base;
  }

  &:hover {
    transform: scale(1.1);
  }

  &:focus-visible {
    outline: 2px solid $color-fjord-deep;
    outline-offset: 4px;
  }

  &--active {
    .hamburger-line {
      &:nth-child(1) {
        transform: rotate(45deg);
      }

      &:nth-child(2) {
        opacity: 0;
        transform: translateX(20px);
      }

      &:nth-child(3) {
        transform: rotate(-45deg);
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
}

.hamburger-line {
  width: 2rem;
  height: 2px;
  background-color: $color-ink;
  border-radius: 10px;
  transform-origin: 1px;

  @media (prefers-reduced-motion: no-preference) {
    transition: all $transition-base;
  }
}

.navbar__menu--mobile {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: $color-canvas;
  border-bottom: 1px solid $color-line;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
}

.nav-list--mobile {
  flex-direction: column;
  gap: 0;
  padding: $spacing-sm $spacing-md;

  .nav-link {
    display: block;
    padding: 0.75rem 0;
    font-size: $font-size-base;
  }
}

.slide-fade-enter-active {
  transition: all $transition-slow;
}

.slide-fade-leave-active {
  transition: all $transition-fast cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: none;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: none;
  }
}

@include tablet {
  .navbar__container {
    padding: 1.25rem $spacing-lg;
  }

  .logo-image {
    height: 60px;
  }

  .navbar__menu--desktop {
    display: block;
  }

  .navbar__toggle {
    display: none;
  }

  .navbar__menu--mobile {
    display: none;
  }
}

@include desktop {
  .nav-list {
    gap: 2.5rem;
  }

  .nav-link {
    font-size: $font-size-base;
  }
}
</style>
