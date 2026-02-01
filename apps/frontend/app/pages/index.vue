<script setup lang="ts">
/**
 * Home Page
 *
 * Main landing page for Atelier Kaisla.
 * SEO optimized with proper meta tags and semantic structure.
 * Features an interactive image gallery with lightbox functionality.
 */

// Gallery data composable
const { galleryImages } = useGalleryData();

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
    <section class="hero">
      <div class="hero__content">
        <h1 class="hero__title">Welcome to Atelier Kaisla</h1>
        <p class="hero__subtitle">Handcrafted wall art and rugs, designed with passion</p>
      </div>
    </section>

    <!-- Gallery Section -->
    <section class="gallery-section">
      <div class="container">
        <header class="gallery-section__header">
          <h2 class="gallery-section__title">Our Collection</h2>
          <p class="gallery-section__description">
            Explore our handcrafted pieces. Click on any image to view it in full size.
          </p>
        </header>

        <ImageGrid :images="galleryImages" />
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
  background-color: $color-white;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
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

.container {
  @include container;
}

.badge-section {
  padding: $spacing-2xl $spacing-md;
  text-align: center;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
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
</style>
