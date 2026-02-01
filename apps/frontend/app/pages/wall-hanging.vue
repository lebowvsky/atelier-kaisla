<script setup lang="ts">
/**
 * Wall Hanging Collection Page
 */

useHead({
  title: 'Wall Hanging'
})

useSeoMeta({
  title: 'Wall Hanging Collection | Atelier Kaisla',
  description: 'Explore our collection of handcrafted wall hangings. Unique pieces designed to transform your space.',
  ogTitle: 'Wall Hanging Collection | Atelier Kaisla',
  ogDescription: 'Explore our collection of handcrafted wall hangings. Unique pieces designed to transform your space.'
})
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>Wall Hanging Collection</h1>
      <p>Browse our beautiful wall hanging collection.</p>
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
