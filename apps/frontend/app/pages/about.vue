<script setup lang="ts">
/**
 * About Page
 *
 * Presents the story of Atelier Kaisla through dynamically fetched sections
 * from the backend API (GET /api/about-sections).
 *
 * @pattern Adapter Pattern
 * @purpose Backend AboutSection entities are adapted to frontend Story interface
 *
 * @pattern Facade Pattern
 * @purpose useAsyncData with $fetch simplifies API interaction
 *
 * @pattern Strategy Pattern
 * @purpose Alternating image positions for visual rhythm
 *
 * Features:
 * - Dynamic content from backend API
 * - Fully responsive layout
 * - SEO optimized with rich meta tags
 * - Accessible with semantic HTML and ARIA
 * - Smooth scroll behavior between sections
 * - Reusable StorySection components
 * - Theme alternation for visual interest
 * - Loading and error state management
 *
 * Accessibility:
 * - WCAG 2.1 AA compliant
 * - Proper heading hierarchy (h1 -> h2)
 * - Semantic HTML structure
 * - Keyboard navigable
 * - Screen reader friendly
 *
 * Performance:
 * - Lazy loaded images
 * - Minimal JavaScript
 * - Optimized for Core Web Vitals
 * - Efficient data fetching with composables
 */

import type { AboutSection } from '~/types/about-section'
import type { Story } from '~/types/story'

// Page content composable - fetches CMS content for the hero section.
const { content: heroContent, fetchSection: fetchHero } = usePageContent('about', 'hero')

// Page content composable - fetches CMS content for the CTA section.
const { content: ctaContent, fetchSection: fetchCta } = usePageContent('about', 'cta')

// Page content composable - fetches CMS content for the social section.
const { content: socialContent, fetchSection: fetchSocial } = usePageContent('about', 'social')

// Hero computed values with static fallback if API returns nothing.
const heroTitle = computed(() => heroContent.value?.title || "À Propos d'Atelier Kaisla")
const heroEyebrow = computed(() => heroContent.value?.eyebrow || 'Atelier')

// CTA computed values with static fallbacks if API returns nothing.
const ctaEyebrow = computed(() => ctaContent.value?.eyebrow || 'Découvrir')
const ctaTitle = computed(() => ctaContent.value?.title || 'Explorez Nos Créations')
const defaultCtaText = "<p>Chaque pièce créée à l'atelier Kaisla est unique et raconte sa propre histoire. Découvrez notre collection de tentures murales et de tapis artisanaux.</p>"
const ctaText = computed(() => {
  const raw = ctaContent.value?.content
  return isEmptyHtml(raw) ? defaultCtaText : sanitizeHtml(raw!)
})

// Social computed values with static fallbacks if API returns nothing.
const socialEyebrow = computed(() => socialContent.value?.eyebrow || 'Restons en contact')
const socialTitle = computed(
  () => socialContent.value?.title || 'Suivez-nous et contactez-nous',
)

const defaultHeroSubtitle = "<p>Découvrez l'histoire d'un atelier artisanal dédié à la création de pièces textiles uniques, où tradition et modernité se rencontrent pour donner vie à des œuvres authentiques.</p>"

const heroSubtitle = computed(() => {
  const raw = heroContent.value?.content
  return sanitizeHtml(raw || defaultHeroSubtitle)
})

// Fetch about sections from backend API using useAsyncData for proper SSR hydration.
// useAsyncData transfers fetched data from server to client via Nuxt payload,
// preventing hydration mismatches caused by re-fetching on client with different URLs.
const { apiFetch } = useApi()

await Promise.all([
  fetchHero(),
  fetchCta(),
  fetchSocial(),
])

const { data: aboutSectionsData, pending: loading, error: fetchError } = await useAsyncData(
  'about-sections',
  () => apiFetch<AboutSection[]>('/about-sections'),
  { server: true }
)

const error = computed(() => fetchError.value ? new Error(fetchError.value.message || 'Failed to load sections') : null)

// Adapter Pattern: Convert backend AboutSection to frontend Story
const stories = computed<Story[]>(() => {
  if (!aboutSectionsData.value || !Array.isArray(aboutSectionsData.value)) {
    return []
  }
  return aboutSectionsData.value.map((section: AboutSection, index: number) => ({
    id: section.id,
    eyebrow: section.eyebrow,
    title: section.title,
    image: {
      src: section.image,
      alt: section.imageAlt,
    },
    content: section.paragraphs.join('\n\n'),
    imagePosition: index % 2 === 0 ? 'left' as const : 'right' as const,
  }))
})

// Page-specific SEO meta tags
useSeo({
  title: 'About the Studio',
  description:
    "Story and mission of Atelier Kaisla: a textile studio dedicated to creating handcrafted wall hangings and rugs, made by hand with passion.",
  image: '/images/about/creator.jpg',
  type: 'website'
})
</script>

<template>
  <div class="about-page">
    <Breadcrumbs :items="[{ name: 'About' }]" />
    <!-- Hero Section -->
    <section class="about-hero" aria-labelledby="about-hero-title">
      <div class="container about-hero__container" lang="fr">
        <div class="about-hero__heading">
          <span class="about-hero__eyebrow">{{ heroEyebrow }}</span>
          <h1 id="about-hero-title" class="about-hero__title">{{ heroTitle }}</h1>
          <span class="about-hero__hairline" aria-hidden="true" />
        </div>
        <div class="about-hero__subtitle" v-html="heroSubtitle" />
      </div>
    </section>

    <!-- Story Sections -->
    <!-- Loading State -->
    <div v-if="loading" class="about-loading" role="status" aria-label="Chargement des sections">
      <div class="container">
        <p class="about-loading__text">Chargement...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="about-error" role="alert">
      <div class="container">
        <p class="about-error__text">
          Impossible de charger les sections. Veuillez r&eacute;essayer plus tard.
        </p>
        <button class="about-error__button" @click="() => refreshNuxtData('about-sections')">
          R&eacute;essayer
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="stories.length === 0" class="about-empty">
      <div class="container">
        <p class="about-empty__text">Aucune section disponible pour le moment.</p>
      </div>
    </div>

    <!-- Sections from API (Adapter + Strategy patterns) -->
    <div v-else class="about-stories" lang="fr">
      <StorySection
        v-for="story in stories"
        :key="story.id"
        :id="story.id"
        :eyebrow="story.eyebrow ?? ''"
        :title="story.title"
        :image="story.image"
        :content="story.content"
        :image-position="story.imagePosition"
        :theme="'light'"
      />
    </div>

    <!-- Call to Action Section -->
    <section class="about-cta" aria-labelledby="about-cta-title">
      <div class="container about-cta__container" lang="fr">
        <div class="about-cta__heading">
          <span class="about-cta__eyebrow">{{ ctaEyebrow }}</span>
          <h2 id="about-cta-title" class="about-cta__title">{{ ctaTitle }}</h2>
          <span class="about-cta__hairline" aria-hidden="true" />
        </div>
        <div class="about-cta__text" v-html="ctaText" />
        <div class="about-cta__buttons">
          <NuxtLink to="/wall-hanging" class="about-cta__button about-cta__button--primary">
            Tentures Murales
          </NuxtLink>
          <NuxtLink to="/rugs" class="about-cta__button about-cta__button--secondary">
            Tapis Artisanaux
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Social Contact Section -->
    <section class="about-social" aria-labelledby="about-social-title">
      <div class="container about-social__container" lang="fr">
        <span class="about-social__eyebrow">{{ socialEyebrow }}</span>
        <h2 id="about-social-title" class="about-social__title">{{ socialTitle }}</h2>
        <span class="about-social__hairline" aria-hidden="true" />
        <LazySocialShare hydrate-on-visible />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.about-page {
  min-height: calc(100vh - $navbar-height);
  background-color: $color-canvas;
}

.container {
  @include container;
}

// --- Hero Section ---
.about-hero {
  background-color: $color-canvas;
  padding: $spacing-3xl $spacing-md;

  @include tablet {
    padding: calc($spacing-3xl + $spacing-xl) $spacing-lg;
  }
}

.about-hero__container {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;

  @include tablet {
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: $spacing-2xl;
    align-items: start;
  }
}

.about-hero__heading {
  display: flex;
  flex-direction: column;
}

.about-hero__eyebrow {
  @include eyebrow;
  margin: 0 0 $spacing-sm;
}

.about-hero__title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $color-ink;
  margin: 0;
  line-height: $line-height-tight;
  letter-spacing: $letter-spacing-tight;

  @include tablet {
    font-size: $font-size-display;
  }
}

.about-hero__hairline {
  @include hairline($color-fjord, 1px);
  display: block;
  width: 48px;
  margin-top: $spacing-md;
}

.about-hero__subtitle {
  @include hero-subtitle($font-size-lg, $font-size-xl);
}

// --- Story Sections Container ---
.about-stories {
  // Story sections have their own padding, no need for additional container padding
}

// --- Loading State ---
.about-loading {
  padding: $spacing-3xl $spacing-md;
  text-align: left;
}

.about-loading__text {
  font-size: $font-size-lg;
  color: $color-stone;
  margin: 0;
}

// --- Error State ---
.about-error {
  padding: $spacing-3xl $spacing-md;
  text-align: left;
}

.about-error__text {
  font-size: $font-size-lg;
  color: $color-ink-soft;
  margin: 0 0 $spacing-lg 0;
}

.about-error__button {
  display: inline-block;
  padding: $spacing-sm $spacing-xl;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $color-canvas;
  background-color: $color-ink;
  border: none;
  border-radius: $border-radius-base;
  cursor: pointer;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }

  &:focus-visible {
    outline: 2px solid $color-fjord-deep;
    outline-offset: 2px;
  }
}

// --- Empty State ---
.about-empty {
  padding: $spacing-3xl $spacing-md;
  text-align: left;
}

.about-empty__text {
  font-size: $font-size-lg;
  color: $color-stone;
  margin: 0;
}

// --- Call to Action Section ---
.about-cta {
  padding: $spacing-3xl $spacing-md;
  background-color: $color-canvas;

  @include tablet {
    padding: calc($spacing-3xl + $spacing-xl) $spacing-lg;
  }
}

.about-cta__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $spacing-md;
}

.about-cta__heading {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.about-cta__eyebrow {
  @include eyebrow;
  margin: 0 0 $spacing-sm;
}

.about-cta__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-ink;
  margin: 0;
  line-height: $line-height-tight;
  letter-spacing: $letter-spacing-tight;

  @include tablet {
    font-size: $font-size-3xl;
  }
}

.about-cta__hairline {
  @include hairline($color-fjord, 1px);
  display: block;
  width: 48px;
  margin: $spacing-md auto $spacing-md;
}

.about-cta__text {
  @include reading-column;
  font-size: $font-size-base;
  color: $color-ink-soft;
  line-height: $line-height-relaxed;
  margin: 0 0 $spacing-xl 0;

  @include tablet {
    font-size: $font-size-lg;
  }
}

.about-cta__buttons {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  align-items: center;

  @include tablet {
    flex-direction: row;
    justify-content: center;
    gap: $spacing-lg;
  }
}

.about-cta__button {
  display: inline-block;
  padding: $spacing-md $spacing-xl;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  text-decoration: none;
  border-radius: $border-radius-base;
  cursor: pointer;
  min-width: 200px;
  text-align: center;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  @include tablet {
    font-size: $font-size-lg;
    padding: $spacing-md calc($spacing-xl + $spacing-md);
  }

  // Hover effect
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }

  // Active effect
  &:active {
    transform: translateY(0);
    box-shadow: $shadow-sm;
  }

  &:focus-visible {
    outline: 2px solid $color-fjord-deep;
    outline-offset: 4px;
  }
}

.about-cta__button--primary {
  background-color: $color-ink;
  color: $color-canvas;
  border: 2px solid $color-ink;

  &:hover {
    background-color: $color-ink-soft;
    border-color: $color-ink-soft;
  }
}

.about-cta__button--secondary {
  background-color: $color-canvas;
  color: $color-ink;
  border: 2px solid $color-ink;

  &:hover {
    background-color: $color-ink;
    color: $color-canvas;
  }
}

// --- Social Section ---
.about-social {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-canvas;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

.about-social__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $spacing-md;
}

.about-social__eyebrow {
  @include eyebrow;
  margin: 0;
}

.about-social__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-ink;
  margin: 0;
  line-height: $line-height-tight;
  letter-spacing: $letter-spacing-tight;

  @include tablet {
    font-size: $font-size-3xl;
  }
}

.about-social__hairline {
  @include hairline($color-fjord, 1px);
  display: block;
  width: 48px;
  margin: $spacing-sm auto $spacing-lg;
}

// --- Accessibility helper ---
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

// --- Reduced motion ---
@media (prefers-reduced-motion: reduce) {
  .about-error__button,
  .about-cta__button {
    transition: none;

    &:hover {
      transform: none;
    }
  }
}

// --- Print styles ---
@media print {
  .about-hero {
    background: $color-canvas;
    padding: $spacing-lg 0;
  }

  .about-cta,
  .about-social {
    display: none;
  }
}
</style>
