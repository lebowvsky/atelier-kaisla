<script setup lang="ts">
/**
 * Footer Component
 *
 * Pattern: Composite Pattern - Structured footer with multiple sections
 * Pattern: Singleton Pattern - Reuses navigation configuration from useNavigation
 * Purpose: Provides site-wide footer with navigation, social links, and legal information
 *
 * Features:
 * - Responsive layout (stacked on mobile, grid on desktop)
 * - Reuses navigation items from useNavigation composable
 * - Integrates SocialShare component
 * - Accessible with proper ARIA labels and semantic HTML
 * - Copyright with dynamic year
 * - SEO-friendly structure
 *
 * Accessibility:
 * - WCAG 2.1 AA compliant
 * - Semantic footer element with nav landmark
 * - Keyboard navigable links
 * - Screen reader friendly
 * - Focus indicators on all interactive elements
 *
 * Design Philosophy:
 * - Elegant, minimalist design matching Atelier Kaisla aesthetic
 * - Clean typography with proper hierarchy
 * - Sufficient spacing and breathing room
 * - Subtle hover effects
 *
 * @example
 * <Footer />
 */

import type { NavigationItem } from '~/types/navigation'

/**
 * Get navigation items using Singleton pattern
 * Ensures consistent navigation across header and footer
 */
const { navigationItems } = useNavigation()

/**
 * Compute current year for copyright
 * Pure function - updates reactively
 */
const currentYear = computed(() => new Date().getFullYear())

/**
 * Footer sections configuration using Composite pattern
 * Organizes footer content into logical groups
 */
interface FooterSection {
  title: string
  links: NavigationItem[]
}

/**
 * Organize navigation items into footer sections
 * Strategy Pattern: Different groupings could be used for different layouts
 */
const footerSections = computed<FooterSection[]>(() => [
  {
    title: 'Shop',
    links: [
      navigationItems.value[1], // Wall Hanging
      navigationItems.value[2], // Rugs
    ]
  },
  {
    title: 'Discover',
    links: [
      navigationItems.value[3], // About
      navigationItems.value[4], // Blog
    ]
  }
])

/**
 * Legal links configuration
 */
const legalLinks = computed<NavigationItem[]>(() => [
  {
    label: 'Privacy Policy',
    path: '/privacy',
    ariaLabel: 'View our privacy policy'
  },
  {
    label: 'Terms of Service',
    path: '/terms',
    ariaLabel: 'View our terms of service'
  },
  {
    label: 'Shipping & Returns',
    path: '/shipping',
    ariaLabel: 'View shipping and returns information'
  }
])
</script>

<template>
  <footer class="footer">
    <div class="footer__container">
      <!-- Top Section: Logo and Navigation -->
      <div class="footer__main">
        <!-- Brand Section -->
        <div class="footer__brand">
          <NuxtLink
            to="/"
            class="footer__logo"
            aria-label="Navigate to Atelier Kaisla home page"
          >
            <h2 class="footer__logo-text">Atelier Kaisla</h2>
          </NuxtLink>
          <p class="footer__tagline">
            Handcrafted wall art and rugs, made with love and attention to detail.
          </p>
        </div>

        <!-- Navigation Sections -->
        <nav
          class="footer__nav"
          aria-label="Footer navigation"
        >
          <div
            v-for="section in footerSections"
            :key="section.title"
            class="footer__nav-section"
          >
            <h3 class="footer__nav-title">{{ section.title }}</h3>
            <ul class="footer__nav-list">
              <li
                v-for="link in section.links"
                :key="link.path"
                class="footer__nav-item"
              >
                <NuxtLink
                  :to="link.path"
                  :aria-label="link.ariaLabel"
                  class="footer__nav-link"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Social Media Section -->
        <div class="footer__social">
          <h3 class="footer__social-title">Connect With Us</h3>
          <SocialShare
            theme="dark"
            :compact="true"
          />
        </div>
      </div>

      <!-- Divider -->
      <div class="footer__divider" role="presentation"></div>

      <!-- Bottom Section: Legal and Copyright -->
      <div class="footer__bottom">
        <!-- Legal Links -->
        <nav
          class="footer__legal"
          aria-label="Legal and policy links"
        >
          <ul class="footer__legal-list">
            <li
              v-for="link in legalLinks"
              :key="link.path"
              class="footer__legal-item"
            >
              <NuxtLink
                :to="link.path"
                :aria-label="link.ariaLabel"
                class="footer__legal-link"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- Copyright -->
        <p class="footer__copyright">
          &copy; {{ currentYear }} Atelier Kaisla. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  background-color: $color-gray-100;
  border-top: 1px solid $color-gray-200;
  padding: $spacing-3xl 0 $spacing-xl;

  @include tablet {
    padding: $spacing-3xl 0 $spacing-2xl;
  }
}

.footer__container {
  @include container;
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

// ==========================================
// Main Section
// ==========================================

.footer__main {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-2xl;

  @include tablet {
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: $spacing-xl;
  }

  @include desktop {
    gap: $spacing-2xl;
  }
}

// ==========================================
// Brand Section
// ==========================================

.footer__brand {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.footer__logo {
  text-decoration: none;
  width: fit-content;
  transition: opacity $transition-base;

  &:hover {
    opacity: 0.7;
  }

  @include focus-visible;
}

.footer__logo-text {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $color-black;
  margin: 0;
  line-height: $line-height-tight;
  letter-spacing: -0.02em;

  @include tablet {
    font-size: $font-size-3xl;
  }
}

.footer__tagline {
  font-size: $font-size-base;
  color: $color-gray-600;
  line-height: $line-height-base;
  margin: 0;
  max-width: 300px;

  @include tablet {
    font-size: $font-size-lg;
  }
}

// ==========================================
// Navigation Section (Composite Pattern)
// ==========================================

.footer__nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-xl;

  @include tablet {
    grid-template-columns: 1fr;
    gap: $spacing-2xl;
  }
}

.footer__nav-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.footer__nav-title {
  font-size: $font-size-base;
  font-weight: 700;
  color: $color-black;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer__nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.footer__nav-item {
  margin: 0;
}

.footer__nav-link {
  font-size: $font-size-base;
  color: $color-gray-600;
  text-decoration: none;
  transition: color $transition-base;
  display: inline-block;

  &:hover {
    color: $color-black;
  }

  @include focus-visible;

  @include tablet {
    font-size: $font-size-lg;
  }
}

// ==========================================
// Social Section
// ==========================================

.footer__social {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  align-items: flex-start;

  @include tablet {
    align-items: flex-start;
  }
}

.footer__social-title {
  font-size: $font-size-base;
  font-weight: 700;
  color: $color-black;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

// ==========================================
// Divider
// ==========================================

.footer__divider {
  width: 100%;
  height: 1px;
  background-color: $color-gray-200;
}

// ==========================================
// Bottom Section (Legal + Copyright)
// ==========================================

.footer__bottom {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  align-items: center;

  @include tablet {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

// ==========================================
// Legal Links
// ==========================================

.footer__legal {
  width: 100%;

  @include tablet {
    width: auto;
  }
}

.footer__legal-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  align-items: center;

  @include tablet {
    flex-direction: row;
    gap: $spacing-lg;
    align-items: center;
  }
}

.footer__legal-item {
  margin: 0;

  &:not(:last-child) {
    @include tablet {
      position: relative;

      &::after {
        content: '•';
        position: absolute;
        right: calc(-1 * $spacing-lg / 2 - 0.25rem);
        top: 50%;
        transform: translateY(-50%);
        color: $color-gray-300;
      }
    }
  }
}

.footer__legal-link {
  font-size: 0.875rem;
  color: $color-gray-600;
  text-decoration: none;
  transition: color $transition-base;
  white-space: nowrap;

  &:hover {
    color: $color-black;
  }

  @include focus-visible;
}

// ==========================================
// Copyright
// ==========================================

.footer__copyright {
  font-size: 0.875rem;
  color: $color-gray-600;
  margin: 0;
  text-align: center;

  @include tablet {
    text-align: left;
  }
}

// ==========================================
// Print Styles
// ==========================================

@media print {
  .footer {
    border-top: 1px solid $color-black;
    padding: $spacing-lg 0;
  }

  .footer__social,
  .footer__legal {
    display: none;
  }

  .footer__main {
    grid-template-columns: 1fr;
  }
}
</style>
