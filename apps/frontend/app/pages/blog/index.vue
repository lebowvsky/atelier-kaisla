<script setup lang="ts">
import type { BlogArticle } from '~/types/blog-article'

const config = useRuntimeConfig()

const getApiUrl = (): string => {
  if (import.meta.client) {
    if (process.env.NODE_ENV === 'production') {
      return config.public.apiUrl
    }
    return 'http://localhost:4000/api'
  }
  return config.public.apiUrl
}

const { data: articles, error, pending: loading } = await useAsyncData(
  'blog-articles',
  () => $fetch<BlogArticle[]>(`${getApiUrl()}/blog`),
  { server: true }
)

useHead({
  title: 'Blog',
})

useSeoMeta({
  title: 'Journal | Atelier Kaisla',
  description:
    'Découvrez nos articles sur l\'artisanat textile, les techniques de tissage, et l\'inspiration créative derrière chaque pièce Atelier Kaisla.',
  ogTitle: 'Journal | Atelier Kaisla',
  ogDescription:
    'Articles et inspirations autour de l\'artisanat textile et du tissage contemporain.',
  ogImage: '/logo-kaisla.png',
  ogUrl: 'https://atelier-kaisla.com/blog',
  twitterTitle: 'Journal | Atelier Kaisla',
  twitterDescription:
    'Découvrez nos articles sur l\'artisanat textile et le tissage.',
  twitterImage: '/logo-kaisla.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="blog-page">
    <!-- Hero Section -->
    <section
      class="blog-hero"
      aria-labelledby="blog-hero-title"
    >
      <div class="container">
        <div class="blog-hero__content">
          <h1
            id="blog-hero-title"
            class="blog-hero__title"
          >
            Journal
          </h1>
          <p class="blog-hero__subtitle">
            Inspirations, techniques et coulisses de l'atelier. Plongez dans l'univers du tissage artisanal.
          </p>
        </div>
      </div>
    </section>

    <!-- Articles Section -->
    <section
      class="blog-articles"
      aria-labelledby="blog-articles-heading"
    >
      <div class="container">
        <h2
          id="blog-articles-heading"
          class="visually-hidden"
        >
          Articles
        </h2>

        <!-- Loading State -->
        <div
          v-if="loading"
          class="blog-articles__grid"
          role="status"
          aria-label="Chargement des articles"
        >
          <BlogCardSkeleton
            v-for="n in 6"
            :key="n"
          />
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="blog-error"
          role="alert"
        >
          <p class="blog-error__text">
            Impossible de charger les articles. Veuillez réessayer plus tard.
          </p>
          <button
            class="blog-error__button"
            @click="() => refreshNuxtData('blog-articles')"
          >
            Réessayer
          </button>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!articles || articles.length === 0"
          class="blog-empty"
        >
          <p class="blog-empty__text">
            Aucun article pour le moment. De nouveaux contenus arrivent bientôt !
          </p>
        </div>

        <!-- Articles Grid -->
        <div
          v-else
          class="blog-articles__grid"
        >
          <BlogCard
            v-for="article in articles"
            :key="article.id"
            :article="article"
          />
        </div>
      </div>
    </section>

    <!-- Social Contact Section -->
    <section
      class="blog-social"
      aria-labelledby="blog-social-title"
    >
      <div class="container">
        <h2
          id="blog-social-title"
          class="visually-hidden"
        >
          Suivez-nous et contactez-nous
        </h2>
        <SocialShare />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.blog-page {
  min-height: calc(100vh - $navbar-height);
  background-color: $color-white;
}

.container {
  @include container;
}

// Hero Section
.blog-hero {
  background: linear-gradient(135deg, $color-gray-100 0%, $color-gray-200 100%);
  padding: $spacing-3xl $spacing-md;
  text-align: center;

  @include tablet {
    padding: calc($spacing-3xl + $spacing-xl) $spacing-lg;
  }
}

.blog-hero__content {
  max-width: $container-content-width;
  margin: 0 auto;
}

.blog-hero__title {
  font-size: $font-size-3xl;
  font-weight: 700;
  color: $color-black;
  margin-bottom: $spacing-md;
  line-height: $line-height-tight;

  @include tablet {
    font-size: $font-size-4xl;
  }
}

.blog-hero__subtitle {
  font-size: $font-size-lg;
  color: $color-gray-600;
  line-height: $line-height-base;
  margin: 0;

  @include tablet {
    font-size: $font-size-xl;
  }
}

// Articles Section
.blog-articles {
  padding: $spacing-2xl $spacing-md;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

.blog-articles__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-lg;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-xl;
  }

  @include desktop {
    grid-template-columns: repeat(3, 1fr);
  }
}

// Error State
.blog-error {
  text-align: center;
  padding: $spacing-2xl;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: $border-radius-base;
}

.blog-error__text {
  color: #c33;
  font-size: $font-size-lg;
  margin: 0 0 $spacing-md;
}

.blog-error__button {
  display: inline-block;
  padding: $spacing-sm $spacing-xl;
  font-size: $font-size-base;
  font-weight: 600;
  color: $color-white;
  background-color: $color-black;
  border: none;
  border-radius: $border-radius-base;
  cursor: pointer;
  transition: background-color $transition-base;

  &:hover {
    background-color: $color-gray-900;
  }

  @include focus-visible;
}

// Empty State
.blog-empty {
  text-align: center;
  padding: $spacing-3xl $spacing-md;
}

.blog-empty__text {
  font-size: $font-size-lg;
  color: $color-gray-600;
  margin: 0;
}

// Social Section
.blog-social {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-white;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

// Accessibility
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
</style>
