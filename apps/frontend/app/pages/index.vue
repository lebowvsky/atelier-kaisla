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

// Hero computed values with static fallback if API returns nothing.
const heroTitle = computed(() => heroContent.value?.title || 'Welcome to Atelier Kaisla')
const heroSubtitle = computed(
  () => heroContent.value?.content || 'Handcrafted wall art and rugs, designed with passion',
)

// Hero background image from API (full URL stored in DB).
// When an image is available, it is used as a CSS background-image with
// a dark overlay for text readability. Without an image the default
// gradient is preserved via the CSS fallback class.
const heroImageUrl = computed(() => heroContent.value?.image || null)
const heroImageAlt = computed(() => heroContent.value?.imageAlt || '')

const heroStyle = computed(() => {
  if (!heroImageUrl.value) return {}
  return {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${heroImageUrl.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
})

// Fetch home grid images and hero content using useAsyncData for SSR support.
// useAsyncData blocks SSR rendering until data is available,
// ensuring consistent server/client markup and preventing hydration mismatches.
// The handler must return a value to transfer the payload to the client.
useAsyncData('home-hero', () => fetchHero(), { server: true })
useAsyncData('home-grid', () => fetchHomeGrid(), {
  server: true,
})

// Page-specific SEO meta tags
useHead({
  title: "Home",
});

useSeoMeta({
  title: "Atelier Kaisla - Handcrafted Wall Art & Rugs",
  description:
    "Discover unique handcrafted wall hangings and rugs at Atelier Kaisla. Each piece is thoughtfully designed and crafted with care.",
  ogTitle: "Atelier Kaisla - Handcrafted Wall Art & Rugs",
  ogDescription:
    "Discover unique handcrafted wall hangings and rugs at Atelier Kaisla. Each piece is thoughtfully designed and crafted with care.",
  ogImage: "/logo-kaisla.png",
  ogUrl: "https://atelier-kaisla.com",
  twitterTitle: "Atelier Kaisla - Handcrafted Wall Art & Rugs",
  twitterDescription: "Discover unique handcrafted wall hangings and rugs at Atelier Kaisla.",
  twitterImage: "/logo-kaisla.png",
});
</script>

<template>
  <div class="home-page">
    <section
      :class="['hero', { 'hero--with-image': heroImageUrl }]"
      :style="heroStyle"
      :aria-label="heroImageAlt || undefined"
      role="img"
    >
      <div class="hero__content">
        <h1 class="hero__title">{{ heroTitle }}</h1>
        <p class="hero__subtitle">{{ heroSubtitle }}</p>
      </div>
    </section>

    <!-- Gallery Section -->
    <section v-if="homeGridImages.length > 0 || gridLoading" class="gallery-section">
      <div class="container">
        <header class="gallery-section__header">
          <h2 class="gallery-section__title">Our Collection</h2>
          <p class="gallery-section__description">
            Explore our handcrafted pieces. Click on any image to view it in full size.
          </p>
        </header>

        <!-- Loading State -->
        <div v-if="gridLoading" class="gallery-section__loading">
          <p>Loading...</p>
        </div>

        <!-- Grid -->
        <ImageGrid v-else :images="homeGridImages" />
      </div>
    </section>

    <!-- Homo Faber Guide Badge Section -->
    <section class="badge-section">
      <div class="container">
        <a
          href="https://www.homofaber.com/"
          target="_blank"
          rel="noopener noreferrer"
          class="badge-link"
          aria-label="Visit Atelier Kaisla on Homo Faber Guide"
        >
          <img
            src="/homo-faber-logo.png"
            alt="Homo Faber Guide - Celebrating Contemporary Craftsmanship"
            class="badge-logo"
          />
        </a>
      </div>
    </section>

    <!-- What is Kaisla Section -->
    <section class="kaisla-intro" aria-labelledby="kaisla-intro-title">
      <div class="container">
        <h2 id="kaisla-intro-title" class="visually-hidden">Qu'est-ce que Kaisla ?</h2>
        <ul class="kaisla-intro__list">
          <li class="kaisla-intro__item kaisla-intro__item--large">
            Un atelier artisanal dédié à la création de pièces murales uniques
          </li>
          <li class="kaisla-intro__item kaisla-intro__item--medium">
            Chaque création est pensée et réalisée à la main avec soin
          </li>
          <li class="kaisla-intro__item kaisla-intro__item--small">
            Des matériaux naturels et durables pour un artisanat responsable
          </li>
          <li class="kaisla-intro__item kaisla-intro__item--medium">
            Un style contemporain inspiré par la nature et les formes organiques
          </li>
          <li class="kaisla-intro__item kaisla-intro__item--large">
            Des œuvres qui transforment votre intérieur en un espace chaleureux et authentique
          </li>
        </ul>
      </div>
    </section>

    <!-- Social Share Section -->
    <section class="social-section" aria-labelledby="social-section-title">
      <div class="container">
        <h2 id="social-section-title" class="visually-hidden">Suivez-nous et contactez-nous</h2>
        <SocialShare />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  min-height: calc(100vh - $navbar-height);
}

.hero {
  background: linear-gradient(135deg, $color-gray-100 0%, $color-gray-200 100%);
  padding: $spacing-2xl $spacing-md;
  text-align: center;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }

  // Variant with background image from API
  &--with-image {
    // Background properties are set via inline style (backgroundImage, backgroundSize, etc.)
    // The overlay is baked into the linear-gradient layer of the background-image.
    padding: $spacing-3xl $spacing-md;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;

    @include tablet {
      padding: calc($spacing-3xl + $spacing-xl) $spacing-lg;
      min-height: 500px;
    }

    .hero__title {
      color: $color-white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .hero__subtitle {
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
  }
}

.hero__content {
  max-width: $container-content-width;
  margin: 0 auto;
}

.hero__title {
  font-size: $font-size-3xl;
  font-weight: 700;
  color: $color-black;
  margin-bottom: $spacing-sm;
  line-height: $line-height-tight;

  @include tablet {
    font-size: 3.5rem;
  }
}

.hero__subtitle {
  font-size: 1.25rem;
  color: $color-gray-600;
  font-weight: 400;

  @include tablet {
    font-size: $font-size-xl;
  }
}

.gallery-section {
  padding: $spacing-2xl $spacing-md;
  padding-bottom: 0;
  background-color: $color-white;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
    padding-bottom: 0;
  }
}

.gallery-section__header {
  text-align: center;
  margin-bottom: $spacing-2xl;
  max-width: $container-content-width;
  margin-left: auto;
  margin-right: auto;
}

.gallery-section__title {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $color-black;
  margin-bottom: $spacing-sm;
  line-height: $line-height-tight;

  @include tablet {
    font-size: $font-size-3xl;
  }
}

.gallery-section__description {
  font-size: $font-size-base;
  color: $color-gray-600;
  line-height: $line-height-base;

  @include tablet {
    font-size: $font-size-lg;
  }
}

.gallery-section__loading {
  text-align: center;
  padding: $spacing-2xl 0;
  color: $color-gray-600;
}

.container {
  @include container;
}

.badge-section {
  padding: $spacing-xl $spacing-md;
  text-align: center;

  @include tablet {
    padding: $spacing-2xl $spacing-lg;
  }
}

.badge-link {
  display: inline-block;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;

  &:hover,
  &:focus {
    transform: translateY(-4px);
    opacity: 0.9;
  }

  &:focus {
    outline: 2px solid $color-black;
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

.kaisla-intro {
  padding: $spacing-3xl $spacing-md;
  padding-top: $spacing-xl;
  background-color: $color-gray-100;
  text-align: center;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
    padding-top: $spacing-2xl;
  }
}

.kaisla-intro__list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;

  @include tablet {
    gap: $spacing-xl;
  }
}

.kaisla-intro__item {
  color: $color-gray-600;
  line-height: $line-height-base;
  font-weight: 400;
  transition: color 0.3s ease;

  &:hover {
    color: $color-black;
  }
}

.kaisla-intro__item--large {
  font-size: $font-size-xl;
  font-weight: 500;

  @include tablet {
    font-size: $font-size-2xl;
  }
}

.kaisla-intro__item--medium {
  font-size: $font-size-lg;

  @include tablet {
    font-size: $font-size-xl;
  }
}

.kaisla-intro__item--small {
  font-size: $font-size-base;

  @include tablet {
    font-size: $font-size-lg;
  }
}

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

.social-section {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-white;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}
</style>
