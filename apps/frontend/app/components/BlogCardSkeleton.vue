<script setup lang="ts">
</script>

<template>
  <div
    class="blog-card-skeleton"
    aria-hidden="true"
  >
    <div class="blog-card-skeleton__image" />
    <div class="blog-card-skeleton__content">
      <div class="blog-card-skeleton__line blog-card-skeleton__line--title" />
      <div class="blog-card-skeleton__line blog-card-skeleton__line--text" />
      <div class="blog-card-skeleton__line blog-card-skeleton__line--short" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.blog-card-skeleton {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: $color-white;
  border-radius: $border-radius-base;
  overflow: hidden;
}

.blog-card-skeleton__image {
  width: 100%;
  aspect-ratio: 3 / 2;
  background: linear-gradient(90deg, $color-gray-100 25%, $color-gray-200 50%, $color-gray-100 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.blog-card-skeleton__content {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  padding: $spacing-md;

  @include tablet {
    padding: $spacing-lg;
  }
}

.blog-card-skeleton__line {
  height: 1rem;
  border-radius: calc($border-radius-base / 2);
  background: linear-gradient(90deg, $color-gray-100 25%, $color-gray-200 50%, $color-gray-100 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;

  &--title {
    width: 75%;
    height: 1.25rem;
  }

  &--text {
    width: 100%;
  }

  &--short {
    width: 40%;
  }
}
</style>
