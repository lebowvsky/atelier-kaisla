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
  font-size: $font-size-base;
  color: $color-gray-600;

  @include container;
}

.breadcrumbs__item {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
}

.breadcrumbs__link {
  color: $color-gray-600;
  text-decoration: none;
  transition: color $transition-fast;

  &:hover,
  &:focus {
    color: $color-black;
    text-decoration: underline;
  }

  &:focus {
    outline: 2px solid $color-black;
    outline-offset: 2px;
  }
}

.breadcrumbs__current {
  color: $color-black;
  font-weight: $font-weight-medium;
}

.breadcrumbs__separator {
  color: $color-gray-300;
}
</style>
