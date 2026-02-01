<script setup lang="ts">
/**
 * About Page
 *
 * Presents the story of Atelier Kaisla through three main sections:
 * - Creator's story
 * - Project's story
 * - Book's story
 *
 * @pattern Template Method Pattern
 * @purpose Consistent page structure with varying content sections
 *
 * @pattern Strategy Pattern
 * @purpose Alternating image positions for visual rhythm
 *
 * Features:
 * - Fully responsive layout
 * - SEO optimized with rich meta tags
 * - Accessible with semantic HTML and ARIA
 * - Smooth scroll behavior between sections
 * - Reusable StorySection components
 * - Theme alternation for visual interest
 *
 * Accessibility:
 * - WCAG 2.1 AA compliant
 * - Proper heading hierarchy (h1 → h2)
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

// Fetch story data using composable (Factory Pattern)
const { aboutStories } = useStoryData()

// Page-specific SEO meta tags
useHead({
  title: 'About'
})

useSeoMeta({
  title: 'À Propos | Atelier Kaisla',
  description:
    'Découvrez l\'histoire d\'Atelier Kaisla : la créatrice passionnée, le projet artisanal, et le livre qui partage notre savoir-faire textile.',
  ogTitle: 'À Propos | Atelier Kaisla',
  ogDescription:
    'Découvrez l\'histoire d\'Atelier Kaisla : la créatrice passionnée, le projet artisanal, et le livre qui partage notre savoir-faire textile.',
  ogImage: '/images/about/creator.jpg',
  ogUrl: 'https://atelier-kaisla.com/about',
  twitterTitle: 'À Propos | Atelier Kaisla',
  twitterDescription: 'Découvrez l\'histoire d\'Atelier Kaisla et notre passion pour l\'artisanat textile.',
  twitterImage: '/images/about/creator.jpg'
})
</script>

<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="about-hero" aria-labelledby="about-hero-title">
      <div class="container">
        <div class="about-hero__content">
          <h1 id="about-hero-title" class="about-hero__title">À Propos d'Atelier Kaisla</h1>
          <p class="about-hero__subtitle">
            Découvrez l'histoire d'un atelier artisanal dédié à la création de pièces textiles
            uniques, où tradition et modernité se rencontrent pour donner vie à des œuvres
            authentiques.
          </p>
        </div>
      </div>
    </section>

    <!-- Story Sections -->
    <!-- Pattern: Template Method with Strategy for alternating layouts -->
    <div class="about-stories">
      <StorySection
        v-for="(story, index) in aboutStories"
        :key="story.id"
        :id="story.id"
        :title="story.title"
        :image="story.image"
        :content="story.content"
        :image-position="story.imagePosition"
        :theme="index % 2 === 0 ? 'light' : 'dark'"
      />
    </div>

    <!-- Call to Action Section -->
    <section class="about-cta" aria-labelledby="about-cta-title">
      <div class="container">
        <div class="about-cta__content">
          <h2 id="about-cta-title" class="about-cta__title">Explorez Nos Créations</h2>
          <p class="about-cta__text">
            Chaque pièce créée à l'atelier Kaisla est unique et raconte sa propre histoire.
            Découvrez notre collection de tentures murales et de tapis artisanaux.
          </p>
          <div class="about-cta__buttons">
            <NuxtLink to="/wall-hanging" class="about-cta__button about-cta__button--primary">
              Tentures Murales
            </NuxtLink>
            <NuxtLink to="/rugs" class="about-cta__button about-cta__button--secondary">
              Tapis Artisanaux
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Social Contact Section -->
    <section class="about-social" aria-labelledby="about-social-title">
      <div class="container">
        <h2 id="about-social-title" class="visually-hidden">Suivez-nous et contactez-nous</h2>
        <SocialShare />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.about-page {
  min-height: calc(100vh - $navbar-height);
  background-color: $color-white;
}

// Hero Section
.about-hero {
  background: linear-gradient(135deg, $color-gray-100 0%, $color-gray-200 100%);
  padding: $spacing-3xl $spacing-md;
  text-align: center;

  @include tablet {
    padding: calc($spacing-3xl + $spacing-xl) $spacing-lg;
  }
}

.about-hero__content {
  max-width: $container-content-width;
  margin: 0 auto;
}

.about-hero__title {
  font-size: $font-size-3xl;
  font-weight: 700;
  color: $color-black;
  margin-bottom: $spacing-md;
  line-height: $line-height-tight;

  @include tablet {
    font-size: $font-size-4xl;
  }
}

.about-hero__subtitle {
  font-size: $font-size-lg;
  color: $color-gray-600;
  line-height: $line-height-base;
  font-weight: 400;
  margin: 0;

  @include tablet {
    font-size: $font-size-xl;
  }
}

// Story Sections Container
.about-stories {
  // Story sections have their own padding, no need for additional container padding
}

// Call to Action Section
.about-cta {
  padding: $spacing-3xl $spacing-md;
  background-color: $color-gray-100;
  text-align: center;

  @include tablet {
    padding: calc($spacing-3xl + $spacing-xl) $spacing-lg;
  }
}

.about-cta__content {
  max-width: $container-content-width;
  margin: 0 auto;
}

.about-cta__title {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $color-black;
  margin-bottom: $spacing-md;
  line-height: $line-height-tight;

  @include tablet {
    font-size: $font-size-3xl;
  }
}

.about-cta__text {
  font-size: $font-size-base;
  color: $color-gray-600;
  line-height: $line-height-base;
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
  font-weight: 600;
  text-decoration: none;
  border-radius: $border-radius-base;
  transition:
    background-color $transition-base,
    color $transition-base,
    transform $transition-base,
    box-shadow $transition-base;
  cursor: pointer;
  min-width: 200px;
  text-align: center;

  @include focus-visible;

  @include tablet {
    font-size: $font-size-lg;
    padding: $spacing-md calc($spacing-xl + $spacing-md);
  }

  // Hover effect
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  // Active effect
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
}

.about-cta__button--primary {
  background-color: $color-black;
  color: $color-white;

  &:hover {
    background-color: $color-gray-900;
  }
}

.about-cta__button--secondary {
  background-color: $color-white;
  color: $color-black;
  border: 2px solid $color-black;

  &:hover {
    background-color: $color-black;
    color: $color-white;
  }
}

// Social Section
.about-social {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-white;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

// Accessibility helper
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

.container {
  @include container;
}

// Print styles
@media print {
  .about-hero {
    background: $color-white;
    padding: $spacing-lg 0;
  }

  .about-cta,
  .about-social {
    display: none;
  }
}
</style>
