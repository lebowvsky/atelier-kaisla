<script setup lang="ts">
/**
 * Blog Page
 */

useHead({
  title: 'Blog'
})

useSeoMeta({
  title: 'Blog | Atelier Kaisla',
  description: 'Read our latest articles about handcrafted art, design inspiration, and creative processes.',
  ogTitle: 'Blog | Atelier Kaisla',
  ogDescription: 'Read our latest articles about handcrafted art, design inspiration, and creative processes.'
})
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>Blog</h1>
      <p>Read our latest articles and insights.</p>
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
