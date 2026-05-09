<script setup lang="ts">
/**
 * RelatedArtworksSection Component
 *
 * Fetches the rest of the collection for the given category and renders up to
 * `limit` other pieces using the existing ArtworkList component.
 *
 * Design Patterns Applied:
 * - @pattern Facade Pattern
 * - @category Structural
 * - @purpose Wraps the products API + adapter behind a simple, declarative
 *   section a parent can drop in with three props.
 *
 * - @pattern Adapter Pattern
 * - @category Structural
 * - @purpose Reuses adaptProductToArtwork to normalise backend Product entities
 *   to the Artwork interface expected by ArtworkList/ArtworkCard.
 *
 * - @pattern Strategy Pattern
 * - @category Behavioral
 * - @purpose Filtering (exclude current product) and limiting (slice) are
 *   composed as pure transformations on the fetched data.
 */

import type { ArtworkCardConfig } from '~/types/artwork'
import type { Product, ProductCategory } from '~/types/product'
import { adaptProductToArtwork } from '~/composables/useProducts'

interface Props {
  currentProductId: string
  category: ProductCategory
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: 3,
})

const apiBaseUrl = useApiBaseUrl()

const cacheKey = computed(() => `related-${props.category}-${props.currentProductId}`)

const { data: rawProducts, pending: loading, error } = await useAsyncData(
  cacheKey.value,
  async () => {
    try {
      return await $fetch<Product[]>(`${apiBaseUrl}/products/category/${props.category}`, {
        timeout: 10000,
      })
    } catch (e) {
      console.error('[RelatedArtworksSection] Error fetching related products:', e)
      return [] as Product[]
    }
  },
)

const relatedArtworks = computed(() => {
  if (!rawProducts.value || !Array.isArray(rawProducts.value)) {
    return []
  }
  return rawProducts.value
    .filter((p) => p.id !== props.currentProductId)
    .slice(0, props.limit)
    .map(adaptProductToArtwork)
})

const cardConfig: ArtworkCardConfig = {
  showPrice: true,
  showAvailability: true,
  clickable: true,
  imageAspectRatio: '4/3',
  enableHover: true,
}

const showSection = computed(() => {
  if (loading.value) return true
  if (error.value) return false
  return relatedArtworks.value.length > 0
})
</script>

<template>
  <section
    v-if="showSection"
    class="related-artworks"
    aria-labelledby="related-artworks-title"
  >
    <header class="related-artworks__header">
      <span class="related-artworks__eyebrow">Et aussi</span>
      <h2
        id="related-artworks-title"
        class="related-artworks__title"
      >
        Autres pièces de la collection
      </h2>
      <span
        class="related-artworks__hairline"
        aria-hidden="true"
      />
    </header>

    <ArtworkList
      :artworks="relatedArtworks"
      :loading="loading"
      :card-config="cardConfig"
      grid-layout="default"
      :skeleton-count="limit"
      empty-message="Aucune autre pièce disponible pour le moment."
    />
  </section>
</template>

<style lang="scss" scoped>
.related-artworks {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
  width: 100%;
}

.related-artworks__header {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.related-artworks__eyebrow {
  @include eyebrow;
  margin: 0;
}

.related-artworks__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-ink;
  letter-spacing: $letter-spacing-tight;
  line-height: $line-height-tight;
  margin: 0;

  @include tablet {
    font-size: $font-size-3xl;
  }
}

.related-artworks__hairline {
  @include hairline($color-fjord, 48px);
  margin-top: $spacing-xs;
}
</style>
