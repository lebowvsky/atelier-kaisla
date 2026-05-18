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

const { content: heroContent, isEmpty: heroIsEmpty, fetchSection: fetchHero } = usePageContent('about', 'hero')
const { content: ctaContent, isEmpty: ctaIsEmpty, fetchSection: fetchCta } = usePageContent('about', 'cta')
const { content: socialContent, isEmpty: socialIsEmpty, fetchSection: fetchSocial } = usePageContent('about', 'social')

const ctaText = computed(() => sanitizeHtml(ctaContent.value?.content ?? ''))

const heroSubtitle = computed(() => sanitizeHtml(heroContent.value?.content ?? ''))

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
    <section v-if="!heroIsEmpty" class="about-hero" aria-labelledby="about-hero-title">
      <div class="container about-hero__container" lang="fr">
        <div class="about-hero__heading">
          <span v-if="heroContent?.eyebrow" class="about-hero__eyebrow">{{ heroContent.eyebrow }}</span>
          <h1 v-if="heroContent?.title" id="about-hero-title" class="about-hero__title">{{ heroContent.title }}</h1>
          <span class="about-hero__hairline" aria-hidden="true" />
        </div>
        <div v-if="heroSubtitle" class="about-hero__subtitle" v-html="heroSubtitle" />
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
    <section v-if="!ctaIsEmpty" class="about-cta" aria-labelledby="about-cta-title">
      <div class="container about-cta__container" lang="fr">
        <div class="about-cta__heading">
          <span v-if="ctaContent?.eyebrow" class="about-cta__eyebrow">{{ ctaContent.eyebrow }}</span>
          <h2 v-if="ctaContent?.title" id="about-cta-title" class="about-cta__title">{{ ctaContent.title }}</h2>
          <span class="about-cta__hairline" aria-hidden="true" />
        </div>
        <div v-if="ctaText" class="about-cta__text" v-html="ctaText" />
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
    <section class="about-connect" aria-labelledby="about-connect-title">
      <div class="container about-connect__container" lang="fr">
        <template v-if="!socialIsEmpty">
          <span v-if="socialContent?.eyebrow" class="about-connect__eyebrow">{{ socialContent.eyebrow }}</span>
          <h2 v-if="socialContent?.title" id="about-connect-title" class="about-connect__title">{{ socialContent.title }}</h2>
          <span class="about-connect__hairline" aria-hidden="true" />
        </template>
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
.about-connect {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-canvas;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

.about-connect__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $spacing-md;
}

.about-connect__eyebrow {
  @include eyebrow;
  margin: 0;
}

.about-connect__title {
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

.about-connect__hairline {
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
  .about-connect {
    display: none;
  }
}
</style>
