<script setup lang="ts">
/**
 * TheProductInfoSection Component
 *
 * Renders the right-hand information column on a product detail page:
 * eyebrow, title, price, availability badge, description, meta details (dl),
 * CTA button, and supporting note.
 *
 * Design Patterns Applied:
 * - @pattern Strategy Pattern
 * - @category Behavioral
 * - @purpose Availability state derives label + style class via a pure mapper.
 *
 * - @pattern Adapter Pattern
 * - @category Structural
 * - @purpose Price (decimal coming as string from the API) is normalised
 *   through `Number(...)` and formatted via Intl.NumberFormat in EUR.
 */

import type { Product } from '~/types/product'
import { CATEGORY_URL_SLUG } from '~/composables/useProducts'

interface Props {
  product: Product
}

const props = defineProps<Props>()

type AvailabilityState = 'in-stock' | 'sold' | 'on-order'

interface AvailabilityDescriptor {
  state: AvailabilityState
  label: string
}

/**
 * Strategy Pattern: derive availability state + label from product attributes.
 * Pure function, no side-effects, fully covered by the three branches called
 * out in the design plan.
 */
const availability = computed<AvailabilityDescriptor>(() => {
  const { status, stockQuantity } = props.product
  if (status === 'available' && stockQuantity > 0) {
    return { state: 'in-stock', label: 'En stock' }
  }
  if (status === 'sold') {
    return { state: 'sold', label: 'Pièce vendue' }
  }
  return { state: 'on-order', label: 'Sur commande' }
})

const categoryEyebrow = computed<string>(() => {
  return props.product.category === 'wall-hanging' ? 'Wall Hanging' : 'Tapis'
})

const formattedPrice = computed<string>(() => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(props.product.price))
})

const formattedDimensions = computed<string | null>(() => {
  const d = props.product.dimensions
  if (!d) return null
  return `${d.width} × ${d.height} ${d.unit}`
})

const referenceCode = computed<string>(() => {
  return props.product.id.slice(0, 8).toUpperCase()
})

/**
 * CTA target: when sold we redirect users back to the collection.
 * Otherwise we open the contact route — and since `/contact` does not yet
 * exist in the app, fall back to a meaningful mailto link with the piece's
 * name and reference pre-filled.
 *
 * Keeping this purely declarative makes it trivial to swap in a real
 * `/contact` page later without touching the component.
 */
const ctaTarget = computed<string>(() => {
  if (availability.value.state === 'sold') {
    return `/${CATEGORY_URL_SLUG[props.product.category]}`
  }
  const subject = encodeURIComponent(
    `Demande sur la pièce « ${props.product.name} » (réf. ${referenceCode.value})`,
  )
  const body = encodeURIComponent(
    `Bonjour Atelier Kaisla,\n\nJe suis intéressé(e) par la pièce « ${props.product.name} » (réf. ${referenceCode.value}).\n\nMerci de m'en dire plus.\n`,
  )
  return `mailto:contact@atelierkaisla.com?subject=${subject}&body=${body}`
})

const ctaLabel = computed<string>(() => {
  return availability.value.state === 'sold'
    ? 'Voir nos autres pièces'
    : 'Nous contacter pour cette pièce'
})

const ctaIsExternal = computed<boolean>(() => {
  return ctaTarget.value.startsWith('mailto:')
})
</script>

<template>
  <section
    class="product-info"
    aria-labelledby="product-info-title"
    lang="fr"
  >
    <p class="product-info__eyebrow">{{ categoryEyebrow }}</p>

    <h1
      id="product-info-title"
      class="product-info__title"
    >
      {{ product.name }}
    </h1>

    <p class="product-info__price">
      {{ formattedPrice }}
    </p>

    <p
      class="product-info__badge"
      :class="`product-info__badge--${availability.state}`"
    >
      {{ availability.label }}
    </p>

    <p
      v-if="product.description"
      class="product-info__description"
    >
      {{ product.description }}
    </p>

    <dl class="product-info__meta">
      <template v-if="formattedDimensions">
        <dt class="product-info__meta-term">Dimensions</dt>
        <dd class="product-info__meta-detail">{{ formattedDimensions }}</dd>
      </template>

      <template v-if="product.materials">
        <dt class="product-info__meta-term">Matériaux</dt>
        <dd class="product-info__meta-detail">{{ product.materials }}</dd>
      </template>

      <dt class="product-info__meta-term">Référence</dt>
      <dd class="product-info__meta-detail">{{ referenceCode }}</dd>
    </dl>

    <div class="product-info__cta-wrapper">
      <a
        v-if="ctaIsExternal"
        :href="ctaTarget"
        class="product-info__cta"
      >
        {{ ctaLabel }}
      </a>
      <NuxtLink
        v-else
        :to="ctaTarget"
        class="product-info__cta"
      >
        {{ ctaLabel }}
      </NuxtLink>

      <p class="product-info__cta-note">
        Pièce unique, fabriquée à la main.
      </p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.product-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  width: 100%;
}

// --- Eyebrow ---
.product-info__eyebrow {
  @include eyebrow;
  margin: 0;
}

// --- Title ---
.product-info__title {
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

// --- Price ---
.product-info__price {
  font-size: $font-size-2xl;
  font-weight: $font-weight-semibold;
  color: $color-ink;
  margin: 0;
  letter-spacing: $letter-spacing-tight;
  line-height: $line-height-tight;
}

// --- Availability badge ---
.product-info__badge {
  display: inline-block;
  align-self: flex-start;
  padding: 6px 14px;
  margin: 0;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  letter-spacing: $letter-spacing-eyebrow;
  text-transform: uppercase;
  border-radius: 999px;
  line-height: $line-height-tight;

  &--in-stock {
    background-color: $color-success-bg;
    color: $color-success-text;
  }

  &--sold {
    background-color: $color-danger-bg;
    color: $color-danger-text;
  }

  &--on-order {
    background-color: $color-canvas-soft;
    color: $color-stone;
    border: 1px solid $color-line;
  }
}

// --- Description ---
.product-info__description {
  @include reading-column;
  margin: $spacing-xs 0 0;
  font-size: $font-size-base;
  color: $color-ink-soft;
  line-height: $line-height-relaxed;
  white-space: pre-line;

  @include tablet {
    font-size: $font-size-lg;
  }
}

// --- Meta list ---
.product-info__meta {
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: $spacing-md;
  row-gap: $spacing-xs;
  margin: $spacing-sm 0 0;
  padding: $spacing-md 0 0;
  border-top: 1px solid $color-line;
}

.product-info__meta-term {
  @include eyebrow;
  margin: 0;
  align-self: center;
}

.product-info__meta-detail {
  margin: 0;
  font-size: $font-size-base;
  color: $color-ink;
  line-height: $line-height-base;
}

// --- CTA ---
.product-info__cta-wrapper {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  margin-top: $spacing-md;
}

.product-info__cta {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 48px;
  padding: $spacing-sm $spacing-lg;
  background-color: $color-ink;
  color: $color-canvas;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.02em;
  text-decoration: none;
  border: none;
  border-radius: $border-radius-base;
  cursor: pointer;
  text-align: center;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform $transition-fast,
      box-shadow $transition-fast,
      background-color $transition-fast;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: $shadow-md;
    background-color: $color-ink-soft;
  }

  &:active {
    transform: translateY(0);
  }

  @include focus-visible;

  @include tablet {
    width: fit-content;
    min-width: 280px;
  }
}

.product-info__cta-note {
  margin: 0;
  font-size: $font-size-sm;
  color: $color-stone;
  line-height: $line-height-base;
}

@media (prefers-reduced-motion: reduce) {
  .product-info__cta {
    transition: none;

    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
}
</style>
