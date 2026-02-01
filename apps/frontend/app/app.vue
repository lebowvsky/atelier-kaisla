<script setup lang="ts">
/**
 * Root App Component
 *
 * Entry point for the Nuxt application.
 * Wraps all pages with NuxtLayout to apply the default layout.
 *
 * SEO: The NuxtRouteAnnouncer improves accessibility by announcing
 * route changes to screen readers.
 */
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
