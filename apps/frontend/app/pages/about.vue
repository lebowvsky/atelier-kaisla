<script setup lang="ts">
/**
 * About Page
 */

useHead({
  title: 'About'
})

useSeoMeta({
  title: 'About Us | Atelier Kaisla',
  description: 'Learn more about Atelier Kaisla, our story, and our passion for handcrafted art.',
  ogTitle: 'About Us | Atelier Kaisla',
  ogDescription: 'Learn more about Atelier Kaisla, our story, and our passion for handcrafted art.'
})
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>About Atelier Kaisla</h1>
      <p>Learn more about our story and passion for handcrafted art.</p>
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
