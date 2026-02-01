<script setup lang="ts">
/**
 * Default Layout
 *
 * Main application layout that wraps all pages with the navigation bar.
 * Implements proper semantic HTML structure for SEO and accessibility.
 *
 * SEO Best Practices:
 * - Semantic HTML5 structure (header, main, footer)
 * - Proper document outline with header and main landmarks
 * - Allows child pages to define their own meta tags via useHead/useSeoMeta
 */

// Global SEO configuration for all pages using this layout
useHead({
  htmlAttrs: {
    lang: "en",
  },
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | Atelier Kaisla` : "Atelier Kaisla - Handcrafted Wall Art & Rugs";
  },
});

useSeoMeta({
  ogType: "website",
  ogLocale: "en_US",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div class="app-layout">
    <!-- Semantic header element for SEO -->
    <header>
      <AppNavbar />
    </header>

    <!-- Main content area with proper semantic element -->
    <main id="main-content" class="main-content">
      <slot />
    </main>

    <!-- Footer with navigation, social links, and legal information -->
    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>
