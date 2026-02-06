<!--
  @pattern Root Application Component
  @purpose Application entry point with routing and layouts
-->

<script setup lang="ts">
/**
 * Root component configuration
 * NuxtLayout provides layout system for pages
 * NuxtRouteAnnouncer provides accessibility for route changes
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
