<script setup lang="ts">
/**
 * TheProductDetailComponent Component
 *
 * Top-level layout for the product detail page. Composes:
 * - Breadcrumbs (Home -> category -> product name)
 * - 2-column main grid: gallery (left) + info (right)
 * - Savoir-faire / craft band powered by the CMS
 * - Related artworks (Other pieces from the collection)
 *
 * The page-level route file is responsible for fetching the eager-loaded
 * product and passing it down. This component is purely presentational.
 *
 * Design Patterns Applied:
 * - @pattern Composite Pattern
 * - @category Structural
 * - @purpose Orchestrates the gallery, info, craft, and related sections as
 *   composable parts of a single product detail tree.
 *
 * - @pattern Facade Pattern
 * - @category Structural
 * - @purpose Hides the underlying composables (CMS fetch, sanitisation) from
 *   the page route which only needs the typed `product` prop.
 */

import type { Product } from '~/types/product'
import { CATEGORY_URL_SLUG } from '~/composables/useProducts'

interface Props {
  product: Product
}

const props = defineProps<Props>()

// --- Breadcrumbs ---
const categorySlug = computed(() => CATEGORY_URL_SLUG[props.product.category])

const categoryLabel = computed(() => {
  return props.product.category === 'wall-hanging' ? 'Wall Hanging' : 'Tapis'
})

const breadcrumbItems = computed(() => [
  { name: categoryLabel.value, url: `/${categorySlug.value}` },
  { name: props.product.name },
])

// --- Gallery images ---
const galleryImages = computed(() => props.product.productImages ?? [])

// --- CMS savoir-faire block ---
const cmsPageSlug = computed(() => (props.product.category === 'rug' ? 'rugs' : 'wall-hanging'))

const { content: craftContent, fetchSection: fetchCraft } = usePageContent(
  cmsPageSlug.value,
  'craft',
)

// Trigger the SSR-safe fetch eagerly so the band is populated on first paint.
await fetchCraft()

const craftEyebrow = computed(() => craftContent.value?.eyebrow || 'Savoir-faire')

const craftTitle = computed(() => craftContent.value?.title || 'Notre savoir-faire')

const defaultCraftCopy = `<p>Chaque pièce est imaginée et tissée à la main dans notre atelier, selon des techniques traditionnelles transmises de génération en génération. Métier à tisser, nouage, finitions : tout est exécuté avec patience.</p><p>Nous travaillons exclusivement des fibres naturelles — laine, coton, lin, jute — souvent teintes avec des pigments végétaux. Chaque création demande plusieurs semaines de travail et porte les irrégularités délicates de la main.</p>`

const craftBody = computed(() => sanitizeHtml(craftContent.value?.content || defaultCraftCopy))
</script>

<template>
  <article class="product-detail" lang="fr">
    <Breadcrumbs :items="breadcrumbItems" />

    <div class="product-detail__container">
      <!-- Main grid: gallery + info -->
      <div class="product-detail__main">
        <TheProductGallerySection
          class="product-detail__gallery"
          :images="galleryImages"
          :product-name="product.name"
        />

        <TheProductInfoSection
          class="product-detail__info"
          :product="product"
        />
      </div>
    </div>

    <!-- Savoir-faire band — full bleed soft canvas -->
    <section
      class="product-detail__craft"
      aria-labelledby="product-craft-title"
    >
      <div class="product-detail__craft-inner">
        <header class="product-detail__craft-header">
          <span class="product-detail__craft-eyebrow">{{ craftEyebrow }}</span>
          <h2
            id="product-craft-title"
            class="product-detail__craft-title"
          >
            {{ craftTitle }}
          </h2>
          <span
            class="product-detail__craft-hairline"
            aria-hidden="true"
          />
        </header>
        <div
          class="product-detail__craft-body"
          v-html="craftBody"
        />
      </div>
    </section>

    <!-- Related artworks -->
    <div class="product-detail__container product-detail__container--related">
      <RelatedArtworksSection
        :current-product-id="product.id"
        :category="product.category"
      />
    </div>
  </article>
</template>

<style lang="scss" scoped>
.product-detail {
  min-height: calc(100vh - $navbar-height);
  background-color: $color-canvas;
  padding-bottom: $spacing-3xl;
}

.product-detail__container {
  @include container;
  padding-left: $spacing-md;
  padding-right: $spacing-md;

  @include tablet {
    padding-left: $spacing-lg;
    padding-right: $spacing-lg;
  }
}

.product-detail__container--related {
  margin-top: $spacing-3xl;
}

// --- Main 2-column grid ---
.product-detail__main {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-xl;
  padding-top: $spacing-xl;

  @include tablet {
    grid-template-columns: 3fr 2fr;
    gap: $spacing-2xl;
    padding-top: $spacing-2xl;
    align-items: start;
  }
}

.product-detail__gallery {
  min-width: 0;
}

.product-detail__info {
  min-width: 0;

  @include tablet {
    position: sticky;
    top: calc($navbar-height + $spacing-md);
  }
}

// --- Savoir-faire band (full bleed soft canvas) ---
.product-detail__craft {
  background-color: $color-canvas-soft;
  margin-top: $spacing-3xl;
  padding: $spacing-2xl 0;

  @include tablet {
    padding: $spacing-3xl 0;
  }
}

.product-detail__craft-inner {
  @include container;
  padding-left: $spacing-md;
  padding-right: $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;

  @include tablet {
    padding-left: $spacing-lg;
    padding-right: $spacing-lg;
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: $spacing-2xl;
    align-items: start;
  }
}

.product-detail__craft-header {
  display: flex;
  flex-direction: column;
}

.product-detail__craft-eyebrow {
  @include eyebrow;
  margin: 0 0 $spacing-sm;
}

.product-detail__craft-title {
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

.product-detail__craft-hairline {
  @include hairline($color-fjord, 48px);
  margin-top: $spacing-md;
}

.product-detail__craft-body {
  @include reading-column;
  font-size: $font-size-base;
  color: $color-ink-soft;
  line-height: $line-height-relaxed;

  @include tablet {
    font-size: $font-size-lg;
  }

  :deep(p) {
    margin: 0 0 $spacing-md;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(strong) {
    font-weight: $font-weight-bold;
    color: $color-ink;
  }

  :deep(em) {
    font-style: italic;
  }
}
</style>
