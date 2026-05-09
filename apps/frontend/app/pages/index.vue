<script setup lang="ts">
/**
 * Home Page
 *
 * Main landing page for Atelier Kaisla.
 * SEO optimized with proper meta tags and semantic structure.
 * Features an interactive image gallery with lightbox functionality.
 *
 * Uses the home grid API to display product images flagged for the home page.
 */

// Home grid composable - fetches images flagged for home page display.
// useHomeGrid uses useState internally for SSR-safe state transfer.
const { images: homeGridImages, loading: gridLoading, fetchHomeGrid } = useHomeGrid()

// Page content composable - fetches CMS content for the hero section.
const { content: heroContent, fetchSection: fetchHero } = usePageContent('home', 'hero')

// Page content composable - fetches CMS content for the intro section.
const { content: introContent, fetchSection: fetchIntro } = usePageContent('home', 'intro')

// Page content composable - fetches CMS content for the gallery section.
const { content: galleryContent, fetchSection: fetchGallery } = usePageContent('home', 'gallery')

// Page content composable - fetches CMS content for the social section.
const { content: socialContent, fetchSection: fetchSocial } = usePageContent('home', 'social')

// Hero computed values with static fallback if API returns nothing.
const heroTitle = computed(() => heroContent.value?.title || 'Welcome to Atelier Kaisla')
const heroSubtitle = computed(
  () => heroContent.value?.content || 'Handcrafted wall art and rugs, designed with passion',
)
const heroEyebrow = computed(
  () => heroContent.value?.eyebrow || 'Atelier · Tapis & tentures murales',
)

const sanitizedHeroSubtitle = computed(() => {
  const raw = heroSubtitle.value
  return isHtmlContent(raw) ? sanitizeHtml(raw) : `<p>${raw}</p>`
})

// Intro computed values with static fallback if API returns nothing.
const introTitle = computed(() => introContent.value?.title || "Qu'est-ce que Kaisla ?")
const introEyebrow = computed(() => introContent.value?.eyebrow || 'Notre démarche')

// Gallery computed values with static fallbacks if API returns nothing.
const galleryEyebrow = computed(() => galleryContent.value?.eyebrow || 'Collection')
const galleryTitle = computed(() => galleryContent.value?.title || 'Our Collection')
const defaultGalleryDescription = '<p>Explore our handcrafted pieces. Click on any image to view it in full size.</p>'
const galleryDescription = computed(() => {
  const raw = galleryContent.value?.content
  return isEmptyHtml(raw) ? defaultGalleryDescription : sanitizeHtml(raw!)
})

// Social computed values with static fallbacks if API returns nothing.
const socialEyebrow = computed(() => socialContent.value?.eyebrow || 'Restons en contact')
const socialTitle = computed(
  () => socialContent.value?.title || 'Suivez-nous et contactez-nous',
)

const defaultIntroHtml = `<ul>
  <li>Un atelier artisanal dédié à la création de pièces murales uniques</li>
  <li>Chaque création est pensée et réalisée à la main avec soin</li>
  <li>Des matériaux naturels et durables pour un artisanat responsable</li>
  <li>Un style contemporain inspiré par la nature et les formes organiques</li>
  <li>Des œuvres qui transforment votre intérieur en un espace chaleureux et authentique</li>
</ul>`

const introHtml = computed(() => {
  const raw = introContent.value?.content
  return sanitizeHtml(raw || defaultIntroHtml)
})

// Hero background image from API (full URL stored in DB).
// Rendered as a NuxtPicture so the browser can pick AVIF/WebP variants
// and the right resolution from srcset. A separate overlay element
// reproduces the previous gradient for text readability.
const heroImageUrl = computed(() => heroContent.value?.image || null)
const heroImageAlt = computed(() => heroContent.value?.imageAlt || '')

// Fetch home grid images and hero content using useAsyncData for SSR support.
// useAsyncData blocks SSR rendering until data is available,
// ensuring consistent server/client markup and preventing hydration mismatches.
// The handler must return a value to transfer the payload to the client.
await Promise.all([
  fetchHero(),
  fetchIntro(),
  fetchGallery(),
  fetchSocial(),
  fetchHomeGrid(),
])

// Page-specific SEO meta tags
useSeo({
  title: 'Handcrafted Wall Hangings and Rugs — Home',
  description:
    "Discover the handcrafted wall hangings and rugs of Atelier Kaisla, made by hand with natural materials and contemporary design.",
  image: '/logo-kaisla.png',
  type: 'website'
})
</script>

<template>
  <div class="home-page">
    <!-- Hero -->
    <section
      :class="['hero', { 'hero--with-image': heroImageUrl }]"
      aria-labelledby="hero-title"
    >
      <NuxtPicture
        v-if="heroImageUrl"
        :src="heroImageUrl"
        :alt="heroImageAlt"
        class="hero__media"
        :img-attrs="{ class: 'hero__img', fetchpriority: 'high' }"
        sizes="100vw lg:1920px"
        width="1920"
        height="900"
        preload
        placeholder
      />
      <div v-if="heroImageUrl" class="hero__overlay" aria-hidden="true" />
      <div class="hero__content">
        <span v-if="heroImageAlt" class="visually-hidden">{{ heroImageAlt }}</span>
        <span class="hero__hairline" aria-hidden="true" />
        <span class="hero__eyebrow">{{ heroEyebrow }}</span>
        <h1 id="hero-title" class="hero__title">{{ heroTitle }}</h1>
        <div class="hero__subtitle" v-html="sanitizedHeroSubtitle" />
      </div>
    </section>

    <!-- Gallery -->
    <section v-if="homeGridImages.length > 0 || gridLoading" class="gallery-section">
      <div class="container">
        <header class="gallery-section__header">
          <div class="gallery-section__heading">
            <span class="gallery-section__eyebrow">{{ galleryEyebrow }}</span>
            <h2 class="gallery-section__title">{{ galleryTitle }}</h2>
            <span class="gallery-section__hairline" aria-hidden="true" />
          </div>
          <div class="gallery-section__description" v-html="galleryDescription" />
        </header>

        <p v-if="gridLoading" role="status" class="gallery-section__loading">
          Loading...
        </p>

        <ImageGrid v-else :images="homeGridImages" />
      </div>
    </section>

    <!-- Homo Faber Badge -->
    <section class="badge-section">
      <div class="container badge-section__container">
        <a
          href="https://www.homofaber.com/"
          target="_blank"
          rel="noopener noreferrer"
          class="badge-link"
          aria-label="Visit Atelier Kaisla on Homo Faber Guide"
        >
          <NuxtImg
            src="/homo-faber-logo.png"
            alt="Homo Faber Guide - Celebrating Contemporary Craftsmanship"
            class="badge-logo"
            width="250"
            height="250"
            loading="lazy"
            format="webp"
          />
        </a>
        <p class="badge-section__caption">
          Member of the Michelangelo Foundation — international distinction
          for contemporary craftsmanship.
        </p>
      </div>
    </section>

    <!-- Kaisla Intro -->
    <section class="kaisla-intro" aria-labelledby="kaisla-intro-title">
      <div class="container kaisla-intro__container" lang="fr">
        <div class="kaisla-intro__heading">
          <span class="kaisla-intro__eyebrow">{{ introEyebrow }}</span>
          <h2 id="kaisla-intro-title" class="kaisla-intro__title">{{ introTitle }}</h2>
          <span class="kaisla-intro__hairline" aria-hidden="true" />
        </div>
        <div class="kaisla-intro__content" v-html="introHtml" />
      </div>
    </section>

    <!-- Social Share -->
    <section class="social-section" aria-labelledby="social-section-title">
      <div class="container social-section__container">
        <span class="social-section__eyebrow">{{ socialEyebrow }}</span>
        <h2 id="social-section-title" class="social-section__title">{{ socialTitle }}</h2>
        <span class="social-section__hairline" aria-hidden="true" />
        <LazySocialShare hydrate-on-visible />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  min-height: calc(100vh - $navbar-height);
}

.container {
  @include container;
}

// --- Hero ---
.hero {
  position: relative;
  isolation: isolate;
  background: linear-gradient(135deg, $color-canvas 0%, $color-canvas-soft 100%);
  padding: $spacing-2xl $spacing-md;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(40vh, 50vh, 520px);
  overflow: hidden;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }

  // Variant with background image from API
  &--with-image {
    padding: $spacing-3xl $spacing-md;
    min-height: clamp(60vh, 70vh, 720px);

    @include tablet {
      padding: calc($spacing-3xl + $spacing-xl) $spacing-lg;
    }

    .hero__eyebrow,
    .hero__title,
    .hero__subtitle {
      // Guarantee 4.5:1 even when the CMS image is light-toned
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    }

    .hero__eyebrow {
      color: rgba(255, 252, 247, 0.85);
    }

    .hero__title {
      color: #fffcf7;
    }

    .hero__subtitle {
      color: rgba(255, 252, 247, 0.92);
    }
  }
}

.hero__media {
  position: absolute;
  inset: 0;
  z-index: -2;
  display: block;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }
}

.hero__overlay {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.55) 0%,
    rgba(0, 0, 0, 0.30) 60%,
    rgba(0, 0, 0, 0.55) 100%
  );
}

.hero__content {
  position: relative;
  max-width: $container-content-width;
  width: 100%;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  @include tablet {
    text-align: left;
    align-items: flex-start;
  }
}

.hero__hairline {
  @include hairline($color-fjord, 1px);
  display: block;
  width: 64px;
  margin-bottom: $spacing-md;
}

.hero__eyebrow {
  @include eyebrow;
  margin: 0 0 $spacing-sm;
  color: $color-stone;
}

.hero__title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $color-ink;
  margin: 0 0 $spacing-sm;
  line-height: $line-height-tight;
  letter-spacing: $letter-spacing-tight;

  @include tablet {
    font-size: $font-size-display;
  }
}

.hero__subtitle {
  color: $color-ink-soft;
  font-weight: $font-weight-normal;
  font-size: $font-size-lg;
  line-height: $line-height-relaxed;
  max-width: 52ch;
  text-align: left;
  margin-inline: auto;

  @include tablet {
    font-size: $font-size-xl;
    margin-inline: 0;
  }

  :deep(p) {
    margin: 0;
  }

  :deep(p + p) {
    margin-top: $spacing-sm;
  }

  :deep(strong) {
    font-weight: $font-weight-bold;
  }

  :deep(em) {
    font-style: italic;
  }
}

// --- Gallery ---
.gallery-section {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-canvas;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

.gallery-section__header {
  margin-bottom: $spacing-2xl;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;

  @include tablet {
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: $spacing-2xl;
    align-items: start;
  }
}

.gallery-section__heading {
  display: flex;
  flex-direction: column;
}

.gallery-section__eyebrow {
  @include eyebrow;
  margin: 0 0 $spacing-sm;
}

.gallery-section__title {
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

.gallery-section__hairline {
  @include hairline($color-fjord, 1px);
  display: block;
  width: 48px;
  margin-top: $spacing-md;
}

.gallery-section__description {
  @include reading-column;
  font-size: $font-size-base;
  color: $color-ink-soft;
  line-height: $line-height-relaxed;
  margin: 0;

  @include tablet {
    font-size: $font-size-lg;
  }
}

.gallery-section__loading {
  padding: $spacing-2xl 0;
  color: $color-stone;
  text-align: left;
  margin: 0;
}

// --- Homo Faber Badge ---
.badge-section {
  padding: $spacing-xl $spacing-md;
  background-color: $color-canvas;

  @include tablet {
    padding: $spacing-2xl $spacing-lg;
  }
}

.badge-section__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-lg;
}

.badge-link {
  display: inline-block;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  &:hover,
  &:focus-visible {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }

  &:focus-visible {
    outline: 2px solid $color-fjord-deep;
    outline-offset: 8px;
  }
}

.badge-logo {
  width: 100%;
  max-width: 200px;
  height: auto;
  display: block;

  @include tablet {
    max-width: 250px;
  }
}

.badge-section__caption {
  font-size: $font-size-base;
  color: $color-ink-soft;
  line-height: $line-height-relaxed;
  max-width: 52ch;
  margin: 0 auto;
  text-align: left;
}

// --- Kaisla Intro ---
.kaisla-intro {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-canvas;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

.kaisla-intro__container {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;

  @include tablet {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: $spacing-2xl;
    align-items: start;
  }
}

.kaisla-intro__heading {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.kaisla-intro__eyebrow {
  @include eyebrow;
  margin: 0 0 $spacing-sm;
}

.kaisla-intro__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-ink;
  margin: 0;
  line-height: $line-height-tight;
  letter-spacing: $letter-spacing-tight;
  text-align: left;

  @include tablet {
    font-size: $font-size-3xl;
  }
}

.kaisla-intro__hairline {
  @include hairline($color-fjord, 1px);
  display: block;
  width: 48px;
  margin-top: $spacing-md;
}

.kaisla-intro__content {
  text-align: left;

  :deep(ul),
  :deep(ol) {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;

    @include tablet {
      gap: $spacing-lg;
    }
  }

  :deep(li) {
    color: $color-ink-soft;
    font-size: $font-size-base;
    line-height: $line-height-relaxed;
    font-weight: $font-weight-normal;
    padding-left: $spacing-md;
    text-indent: -$spacing-md;

    @include tablet {
      font-size: $font-size-lg;
    }

    &::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      background-color: $color-fjord;
      margin-right: $spacing-sm;
      vertical-align: middle;
      transform: translateY(-2px);
    }
  }

  :deep(p) {
    color: $color-ink-soft;
    font-size: $font-size-base;
    line-height: $line-height-relaxed;
    margin: 0 0 $spacing-md;

    @include tablet {
      font-size: $font-size-lg;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(strong) {
    font-weight: $font-weight-bold;
  }

  :deep(em) {
    font-style: italic;
  }

  :deep(h2),
  :deep(h3) {
    color: $color-ink;
    font-weight: $font-weight-bold;
    margin: 0 0 $spacing-sm;
    line-height: $line-height-tight;
    letter-spacing: $letter-spacing-tight;
  }

  :deep(h2) {
    font-size: $font-size-xl;

    @include tablet {
      font-size: $font-size-2xl;
    }
  }

  :deep(h3) {
    font-size: $font-size-lg;

    @include tablet {
      font-size: $font-size-xl;
    }
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid $color-line;
    margin: $spacing-lg 0;
  }
}

// --- Social Share ---
.social-section {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-canvas;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

.social-section__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $spacing-md;
}

.social-section__eyebrow {
  @include eyebrow;
  margin: 0;
}

.social-section__title {
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

.social-section__hairline {
  @include hairline($color-fjord, 1px);
  display: block;
  width: 48px;
  margin: $spacing-sm auto $spacing-lg;
}

// --- Utilities ---
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
  .badge-link {
    transition: none;

    &:hover,
    &:focus-visible {
      transform: none;
    }
  }
}
</style>
