<script setup lang="ts">
/**
 * Social Share Demo Page
 *
 * Demonstration page showcasing the SocialShare component
 * with different variations and themes.
 */

useHead({
  title: 'Social Share Demo'
})

useSeoMeta({
  title: 'Social Share Component Demo - Atelier Kaisla',
  description: 'Demonstration of the SocialShare component with various configurations',
  robots: 'noindex, nofollow' // Demo page, don't index
})
</script>

<template>
  <div class="demo-page">
    <div class="container">
      <header class="demo-header">
        <h1 class="demo-title">SocialShare Component Demo</h1>
        <p class="demo-description">
          Showcasing the SocialShare component with different themes and configurations.
        </p>
      </header>

      <!-- Default Theme -->
      <section class="demo-section">
        <h2 class="demo-section__title">Default (Dark Theme)</h2>
        <div class="demo-section__content demo-section__content--light">
          <SocialShare />
        </div>
      </section>

      <!-- Light Theme -->
      <section class="demo-section">
        <h2 class="demo-section__title">Light Theme</h2>
        <div class="demo-section__content demo-section__content--dark">
          <SocialShare theme="light" />
        </div>
      </section>

      <!-- Compact Mode -->
      <section class="demo-section">
        <h2 class="demo-section__title">Compact Mode</h2>
        <div class="demo-section__content demo-section__content--light">
          <SocialShare :compact="true" />
        </div>
      </section>

      <!-- Compact + Light Theme -->
      <section class="demo-section">
        <h2 class="demo-section__title">Compact + Light Theme</h2>
        <div class="demo-section__content demo-section__content--dark">
          <SocialShare theme="light" :compact="true" />
        </div>
      </section>

      <!-- Usage Examples -->
      <section class="demo-section demo-section--code">
        <h2 class="demo-section__title">Usage Examples</h2>

        <div class="code-example">
          <h3 class="code-example__title">Basic Usage</h3>
          <pre class="code-example__code"><code>&lt;SocialShare /&gt;</code></pre>
        </div>

        <div class="code-example">
          <h3 class="code-example__title">Light Theme</h3>
          <pre class="code-example__code"><code>&lt;SocialShare theme="light" /&gt;</code></pre>
        </div>

        <div class="code-example">
          <h3 class="code-example__title">Compact Mode</h3>
          <pre class="code-example__code"><code>&lt;SocialShare :compact="true" /&gt;</code></pre>
        </div>

        <div class="code-example">
          <h3 class="code-example__title">Combined Props</h3>
          <pre class="code-example__code"><code>&lt;SocialShare theme="light" :compact="true" /&gt;</code></pre>
        </div>
      </section>

      <!-- Design Patterns Info -->
      <section class="demo-section demo-section--patterns">
        <h2 class="demo-section__title">Design Patterns Applied</h2>

        <ul class="pattern-list">
          <li class="pattern-item">
            <strong>Factory Pattern:</strong> Social links created via factory function
          </li>
          <li class="pattern-item">
            <strong>Strategy Pattern:</strong> Different sorting and theme strategies
          </li>
          <li class="pattern-item">
            <strong>Adapter Pattern:</strong> Data structure ready for API integration
          </li>
          <li class="pattern-item">
            <strong>Singleton Pattern:</strong> Composable caching for data consistency
          </li>
        </ul>
      </section>

      <!-- Back to Home -->
      <footer class="demo-footer">
        <NuxtLink to="/" class="demo-link">← Back to Home</NuxtLink>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.demo-page {
  min-height: calc(100vh - $navbar-height);
  padding: $spacing-2xl $spacing-md;
  background-color: $color-gray-100;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

.container {
  @include container;
  max-width: 1000px;
}

.demo-header {
  text-align: center;
  margin-bottom: $spacing-3xl;
}

.demo-title {
  font-size: $font-size-3xl;
  font-weight: 700;
  color: $color-black;
  margin-bottom: $spacing-sm;

  @include tablet {
    font-size: $font-size-4xl;
  }
}

.demo-description {
  font-size: $font-size-lg;
  color: $color-gray-600;
  max-width: 600px;
  margin: 0 auto;
}

.demo-section {
  background-color: $color-white;
  border-radius: $border-radius-base;
  padding: $spacing-xl;
  margin-bottom: $spacing-xl;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @include tablet {
    padding: $spacing-2xl;
  }

  &--code,
  &--patterns {
    background-color: $color-gray-900;
    color: $color-white;
  }
}

.demo-section__title {
  font-size: $font-size-xl;
  font-weight: 600;
  color: $color-black;
  margin-bottom: $spacing-lg;
  text-align: center;

  @include tablet {
    font-size: $font-size-2xl;
  }

  .demo-section--code &,
  .demo-section--patterns & {
    color: $color-white;
  }
}

.demo-section__content {
  padding: $spacing-xl;
  border-radius: $border-radius-base;

  &--light {
    background-color: $color-white;
  }

  &--dark {
    background-color: $color-gray-900;
  }
}

.code-example {
  margin-bottom: $spacing-lg;

  &:last-child {
    margin-bottom: 0;
  }
}

.code-example__title {
  font-size: $font-size-base;
  font-weight: 500;
  color: $color-gray-300;
  margin-bottom: $spacing-xs;
}

.code-example__code {
  background-color: $color-black;
  color: #a6e22e; // Green for code syntax
  padding: $spacing-md;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  margin: 0;

  code {
    color: inherit;
  }
}

.pattern-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.pattern-item {
  background-color: rgba(255, 255, 255, 0.1);
  padding: $spacing-md;
  border-radius: 4px;
  color: $color-gray-300;
  line-height: $line-height-base;

  strong {
    color: $color-white;
    font-weight: 600;
  }
}

.demo-footer {
  text-align: center;
  margin-top: $spacing-2xl;
  padding-top: $spacing-xl;
  border-top: 2px solid $color-gray-300;
}

.demo-link {
  color: $color-black;
  text-decoration: none;
  font-size: $font-size-lg;
  font-weight: 500;
  transition: color $transition-base;

  @include link-underline;

  &:hover {
    color: $color-gray-600;
  }

  @include focus-visible;
}
</style>
