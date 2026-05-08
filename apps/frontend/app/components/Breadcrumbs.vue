<script setup lang="ts">
import type { BreadcrumbItem } from '~/composables/useStructuredData'

const props = defineProps<{
  items: BreadcrumbItem[]
}>()

const allItems = computed<BreadcrumbItem[]>(() => [
  { name: 'Home', url: '/' },
  ...props.items
])

useBreadcrumbsSchema(allItems)
</script>

<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol class="breadcrumbs__list">
      <li
        v-for="(item, index) in allItems"
        :key="index"
        class="breadcrumbs__item"
      >
        <NuxtLink
          v-if="item.url && index < allItems.length - 1"
          :to="item.url"
          class="breadcrumbs__link"
        >
          {{ item.name }}
        </NuxtLink>
        <span
          v-else
          class="breadcrumbs__current"
          aria-current="page"
        >
          {{ item.name }}
        </span>
        <span
          v-if="index < allItems.length - 1"
          class="breadcrumbs__separator"
          aria-hidden="true"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<style lang="scss" scoped>
.breadcrumbs {
  padding: $spacing-sm $spacing-md;

  @include tablet {
    padding: $spacing-md $spacing-lg;
  }
}

.breadcrumbs__list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  list-style: none;
  margin: 0;
  padding: 0;

  // Editorial eyebrow style: uppercase small caps stone with 0.12em letter-spacing.
  // Applied at the list level so all items inherit the magazine cadence.
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: $letter-spacing-eyebrow;
  text-transform: uppercase;
  color: $color-stone;

  @include container;
}

.breadcrumbs__item {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
}

.breadcrumbs__link {
  color: $color-stone;
  text-decoration: none;

  @media (prefers-reduced-motion: no-preference) {
    transition: color $transition-fast;
  }

  &:hover {
    color: $color-ink;
  }

  &:focus-visible {
    outline: 2px solid $color-fjord-deep;
    outline-offset: 2px;
  }
}

.breadcrumbs__current {
  color: $color-ink;
  font-weight: $font-weight-medium;
}

.breadcrumbs__separator {
  color: $color-line;
}
</style>
