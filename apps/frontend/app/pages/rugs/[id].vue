<script setup lang="ts">
/**
 * Rug Detail Page
 *
 * Dynamic route serving the detail page for a single rug.
 * Eagerly loads the product on the server (SSR), enforces the category
 * matches the URL, and delegates rendering to TheProductDetailComponent.
 *
 * Note: the URL slug is plural (`/rugs/[id]`) but the product category
 * enum value is singular (`'rug'`).
 *
 * Design Patterns Applied:
 * - @pattern Facade Pattern
 * - @category Structural
 * - @purpose The route file is a thin facade over the API + the detail
 *   composition component.
 *
 * - @pattern Decorator Pattern (implicit via useAsyncData)
 * - @category Structural
 * - @purpose Loading + error states handled by Nuxt around the fetch.
 */

import type { Product } from '~/types/product'

const route = useRoute()
const id = computed(() => route.params.id as string)

const apiBaseUrl = useApiBaseUrl()

const { data: product, error } = await useAsyncData(
  `product-${id.value}`,
  async () => {
    try {
      return await $fetch<Product>(`${apiBaseUrl}/products/${id.value}`, {
        timeout: 10000,
      })
    } catch {
      return null
    }
  },
)

if (!product.value || error.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Produit introuvable',
    fatal: true,
  })
}

if (product.value.category !== 'rug') {
  throw createError({
    statusCode: 404,
    statusMessage: 'Catégorie incorrecte',
    fatal: true,
  })
}

useSeo({
  title: () => product.value?.name ?? 'Pièce',
  description: () =>
    product.value?.description
      ?? `${product.value?.name ?? 'Pièce'} — création artisanale Atelier Kaisla.`,
  image: () => product.value?.productImages?.[0]?.url ?? '/logo-kaisla.png',
  type: 'product',
})

useProductSchema(product)
</script>

<template>
  <TheProductDetailComponent
    v-if="product"
    :product="product"
  />
</template>
