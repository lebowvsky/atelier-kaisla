<script setup lang="ts">
/**
 * SocialShare Component
 *
 * Displays social media links and contact information for Atelier Kaisla.
 * Fetches data dynamically from the backend API (GET /api/contact-links)
 * with graceful fallback to hardcoded data if the API is unavailable.
 *
 * Design Patterns:
 * - Facade Pattern: useSocialData composable abstracts API + fallback logic
 * - Adapter Pattern: Backend ContactLink entities adapted to frontend SocialLink
 * - Strategy Pattern: Different rendering strategies for different platforms
 * - Functional Programming: Pure functions, immutable data, reactive state
 *
 * Features:
 * - Dynamic data from backend API with fallback
 * - Responsive layout (stacked on mobile, horizontal on desktop)
 * - Accessible links with ARIA labels
 * - Hover effects on social icons
 * - Inline SVG icons for performance and theming
 * - Email link with proper mailto protocol
 * - Keyboard accessible
 * - SSR compatible (data fetched server-side via useAsyncData)
 * - Graceful fallback if API is unavailable
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
 * @example
 * <SocialShare />
 *
 * @example With custom theme
 * <SocialShare theme="light" />
 */

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

// Fetch social media data using composable (Facade + Adapter pattern)
// useContactLinks now uses Nuxt's useState internally, ensuring state
// is transferred from server to client via Nuxt payload (no hydration mismatch).
const { socialLinks, contactInfo, fetchSocialData } = useSocialData()

// Fetch data using useAsyncData for SSR compatibility.
// useAsyncData blocks SSR rendering until data is available, ensuring the
// server and client render with the same data (preventing hydration mismatches).
// The handler returns a value so Nuxt can transfer the payload to the client.
// Nuxt deduplicates this call across components using the same key.
useAsyncData('contact-links', () => fetchSocialData(), {
  dedupe: 'defer',
  server: true,
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
  color: $color-ink;
  text-decoration: none;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform $transition-base,
      color $transition-base,
      box-shadow $transition-base;
  }

  // Accessibility: cobalt focus indicator
  &:focus-visible {
    outline: 2px solid $color-fjord-deep;
    outline-offset: 4px;
  }

  // Hover effect: editorial translateY + subtle ink darken (no cobalt)
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
    color: $color-ink-soft;
  }

  // Active effect
  &:active {
    transform: translateY(-1px);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover,
    &:active {
      transform: none;
    }
  }

  // Light theme (used on dark backdrops only — keep canvas/stone)
  .social-share--light & {
    color: $color-canvas;

    &:hover {
      color: $color-canvas-soft;
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

  // Show on focus for keyboard users — editorial ink/canvas chip
  .social-share__link:focus & {
    position: static;
    width: auto;
    height: auto;
    margin: 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
    background-color: $color-ink;
    color: $color-canvas;
    padding: $spacing-xs;
    font-size: $font-size-sm;
    border-radius: $border-radius-sm;
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
  color: $color-ink-soft;
  margin: 0;
  font-weight: $font-weight-medium;
  line-height: $line-height-base;

  .social-share--light & {
    color: $color-canvas;
  }
}

.social-share__email {
  font-size: $font-size-lg;
  color: $color-ink;
  text-decoration: none;
  font-weight: $font-weight-semibold;
  position: relative;

  @media (prefers-reduced-motion: no-preference) {
    transition: color $transition-base;
  }

  // Underline animation using mixin
  @include link-underline;

  &:hover {
    color: $color-ink-soft;
  }

  &:focus-visible {
    outline: 2px solid $color-fjord-deep;
    outline-offset: 4px;
  }

  .social-share--light & {
    color: $color-canvas;

    &:hover {
      color: $color-canvas-soft;
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
