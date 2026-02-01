<script setup lang="ts">
/**
 * Rugs Collection Page
 */

useHead({
  title: 'Rugs'
})

useSeoMeta({
  title: 'Rugs Collection | Atelier Kaisla',
  description: 'Discover our collection of handcrafted rugs. Each piece is a work of art for your home.',
  ogTitle: 'Rugs Collection | Atelier Kaisla',
  ogDescription: 'Discover our collection of handcrafted rugs. Each piece is a work of art for your home.'
})
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>Rugs Collection</h1>
      <p>Discover our exquisite rug collection.</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  @include page-wrapper;
}

.container {
  @include container;
}

h1 {
  font-size: $font-size-3xl;
  margin-bottom: $spacing-sm;
  color: $color-black;
}

p {
  font-size: $font-size-lg;
  color: $color-gray-600;
}
</style>
