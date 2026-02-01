<script setup lang="ts">
/**
 * SocialShare Component
 *
 * Displays social media links and contact information for Atelier Kaisla.
 * Designed with extensibility in mind for future API integration.
 *
 * Design Patterns:
 * - Factory Pattern: Social links created via factory function in composable
 * - Strategy Pattern: Different rendering strategies for different platforms
 * - Adapter Pattern: Data structure ready for API integration
 * - Functional Programming: Pure functions, immutable data, reactive state
 *
 * Features:
 * - Responsive layout (stacked on mobile, horizontal on desktop)
 * - Accessible links with ARIA labels
 * - Hover effects on social icons
 * - Inline SVG icons for performance and theming
 * - Email link with proper mailto protocol
 * - Keyboard accessible
 * - Extensible architecture for adding new platforms
 *
 * SEO Considerations:
 * - Semantic HTML structure
 * - Proper link attributes (rel, target)
 * - Descriptive aria-labels
 * - Schema.org structured data ready
 *
 * Accessibility:
 * - WCAG 2.1 AA compliant
 * - Keyboard navigable
 * - Screen reader friendly
 * - Sufficient color contrast
 * - Focus indicators
 *
 * Future Enhancements:
 * - Replace useSocialData() with API call
 * - Add share functionality (share current page)
 * - Add analytics tracking on link clicks
 * - Add platform availability status
 *
 * @example
 * <SocialShare />
 *
 * @example With custom theme
 * <SocialShare theme="light" />
 */

import type { SocialShareConfig } from '~/types/social'

interface Props {
  /**
   * Optional theme override (defaults to 'dark' from composable)
   */
  theme?: 'light' | 'dark'

  /**
   * Optional compact mode for smaller spacing
   */
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'dark',
  compact: false
})

// Fetch social media data using composable (Factory + Adapter pattern)
const { socialLinks, contactInfo } = useSocialData()

/**
 * Handle social link click
 * Future: Add analytics tracking here
 *
 * @param platform - Social media platform name
 * @param url - Target URL
 */
const handleSocialClick = (platform: string, url: string): void => {
  // Future enhancement: Track analytics
  // trackEvent('social_click', { platform, url })

  // Link navigation is handled by the anchor tag
  // This function is a hook for future analytics integration
}

/**
 * Handle email link click
 * Future: Add analytics tracking
 */
const handleEmailClick = (): void => {
  // Future enhancement: Track analytics
  // trackEvent('email_click', { email: contactInfo.email })
}

/**
 * Get icon fill color based on theme
 * Strategy Pattern: Different colors for different themes
 *
 * @returns CSS color value
 */
const iconColor = computed(() => {
  return props.theme === 'light' ? '#ffffff' : '#000000'
})

/**
 * Compute container classes based on props
 * Pure function for class generation
 */
const containerClasses = computed(() => {
  return {
    'social-share': true,
    'social-share--compact': props.compact,
    [`social-share--${props.theme}`]: true
  }
})
</script>

<template>
  <div :class="containerClasses">
    <!-- Social Media Links Section -->
    <div class="social-share__links">
      <a
        v-for="link in socialLinks"
        :key="link.platform"
        :href="link.url"
        :aria-label="link.ariaLabel"
        class="social-share__link"
        target="_blank"
        rel="noopener noreferrer"
        @click="handleSocialClick(link.platform, link.url)"
      >
        <!-- Inline SVG Icon -->
        <svg
          class="social-share__icon"
          :aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path :d="link.iconPath" />
        </svg>

        <!-- Platform Name (visible on hover/focus for context) -->
        <span class="social-share__name">{{ link.name }}</span>
      </a>
    </div>

    <!-- Contact Information Section -->
    <div class="social-share__contact">
      <p class="social-share__contact-label">
        {{ contactInfo.label }}
      </p>
      <a
        :href="`mailto:${contactInfo.email}`"
        :aria-label="contactInfo.ariaLabel"
        class="social-share__email"
        @click="handleEmailClick"
      >
        {{ contactInfo.email }}
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.social-share {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-lg;
  padding: $spacing-xl 0;

  @include tablet {
    gap: $spacing-xl;
  }

  // Compact mode reduces spacing
  &--compact {
    gap: $spacing-md;
    padding: $spacing-lg 0;

    @include tablet {
      gap: $spacing-lg;
    }
  }
}

.social-share__links {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  @include tablet {
    gap: $spacing-lg;
  }
}

.social-share__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: $color-black;
  text-decoration: none;
  transition:
    transform $transition-base,
    color $transition-base;

  // Accessibility: Focus indicator
  @include focus-visible;

  // Hover effect: slight scale and rotation
  &:hover {
    transform: scale(1.1) rotate(5deg);
    color: $color-gray-600;
  }

  // Active effect
  &:active {
    transform: scale(0.95);
  }

  // Light theme
  .social-share--light & {
    color: $color-white;

    &:hover {
      color: $color-gray-300;
    }
  }
}

.social-share__icon {
  width: 32px;
  height: 32px;
  transition: inherit;

  @include tablet {
    width: 40px;
    height: 40px;
  }
}

.social-share__name {
  // Visually hidden but accessible to screen readers
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;

  // Show on focus for keyboard users
  .social-share__link:focus & {
    position: static;
    width: auto;
    height: auto;
    margin: 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
    background-color: $color-black;
    color: $color-white;
    padding: $spacing-xs;
    font-size: 0.875rem;
    border-radius: 4px;
    margin-top: $spacing-xs;
  }
}

.social-share__contact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  text-align: center;
}

.social-share__contact-label {
  font-size: $font-size-base;
  color: $color-gray-900;
  margin: 0;
  font-weight: 500;
  line-height: $line-height-base;

  .social-share--light & {
    color: $color-white;
  }
}

.social-share__email {
  font-size: $font-size-lg;
  color: $color-black;
  text-decoration: none;
  font-weight: 600;
  position: relative;
  transition: color $transition-base;

  // Underline animation using mixin
  @include link-underline;

  &:hover {
    color: $color-gray-600;
  }

  @include focus-visible;

  .social-share--light & {
    color: $color-white;

    &:hover {
      color: $color-gray-300;
    }
  }
}

// Responsive adjustments
@include tablet {
  .social-share__contact-label {
    font-size: $font-size-lg;
  }

  .social-share__email {
    font-size: $font-size-xl;
  }
}

// Print styles: show email, hide icons
@media print {
  .social-share__links {
    display: none;
  }

  .social-share__email {
    text-decoration: underline;
  }
}
</style>
