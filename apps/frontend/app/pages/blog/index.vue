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

// Page content composables - fetch CMS content for hero, articles header and social section.
const { content: heroContent, fetchSection: fetchHero } = usePageContent('blog', 'hero')
const { content: articlesContent, fetchSection: fetchArticles } = usePageContent('blog', 'articles')
const { content: socialContent, fetchSection: fetchSocial } = usePageContent('blog', 'social')

// Hero computed values with static fallbacks if API returns nothing.
const heroEyebrow = computed(() => heroContent.value?.eyebrow || 'Journal')
const heroTitle = computed(() => heroContent.value?.title || 'Journal')
const defaultHeroSubtitle = "<p>Inspirations, techniques et coulisses de l'atelier. Plongez dans l'univers du tissage artisanal.</p>"
const heroSubtitle = computed(() => {
  const raw = heroContent.value?.content
  return isEmptyHtml(raw) ? defaultHeroSubtitle : sanitizeHtml(raw!)
})

// Articles header computed values with static fallbacks if API returns nothing.
const articlesEyebrow = computed(() => articlesContent.value?.eyebrow || 'Lectures')
const articlesTitle = computed(() => articlesContent.value?.title || 'Articles récents')

// Social computed values with static fallbacks if API returns nothing.
const socialEyebrow = computed(() => socialContent.value?.eyebrow || 'Restons en contact')
const socialTitle = computed(
  () => socialContent.value?.title || 'Suivez-nous et contactez-nous',
)

await Promise.all([
  fetchHero(),
  fetchArticles(),
  fetchSocial(),
])

const { data: articles, error, pending: loading } = await useAsyncData(
  'blog-articles',
  () => $fetch<BlogArticle[]>(`${getApiUrl()}/blog`),
  { server: true }
)

useSeo({
  title: 'Journal',
  description:
    "News, craft and behind the scenes of Atelier Kaisla: articles dedicated to weaving, natural materials and the creative process behind each piece.",
  image: '/logo-kaisla.png',
  type: 'website'
})

useCollectionPageSchema('Journal')
</script>

<template>
  <div class="blog-page">
    <Breadcrumbs :items="[{ name: 'Journal' }]" />
    <!-- Hero Section -->
    <section
      class="blog-hero"
      aria-labelledby="blog-hero-title"
    >
      <div class="container blog-hero__container" lang="fr">
        <div class="blog-hero__heading">
          <span class="blog-hero__eyebrow">{{ heroEyebrow }}</span>
          <h1
            id="blog-hero-title"
            class="blog-hero__title"
          >
            {{ heroTitle }}
          </h1>
          <span class="blog-hero__hairline" aria-hidden="true" />
        </div>
        <div class="blog-hero__subtitle" v-html="heroSubtitle" />
      </div>
    </section>

    <!-- Articles Section -->
    <section
      class="blog-articles"
      aria-labelledby="blog-articles-heading"
    >
      <div class="container">
        <header class="blog-articles__header" lang="fr">
          <span class="blog-articles__eyebrow">{{ articlesEyebrow }}</span>
          <h2
            id="blog-articles-heading"
            class="blog-articles__title"
          >
            {{ articlesTitle }}
          </h2>
          <span class="blog-articles__hairline" aria-hidden="true" />
        </header>

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
      <div class="container blog-social__container" lang="fr">
        <span class="blog-social__eyebrow">{{ socialEyebrow }}</span>
        <h2
          id="blog-social-title"
          class="blog-social__title"
        >
          {{ socialTitle }}
        </h2>
        <span class="blog-social__hairline" aria-hidden="true" />
        <LazySocialShare hydrate-on-visible />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.blog-page {
  min-height: calc(100vh - $navbar-height);
  background-color: $color-canvas;
}

.container {
  @include container;
}

// --- Hero Section ---
.blog-hero {
  background-color: $color-canvas;
  padding: $spacing-3xl $spacing-md;

  @include tablet {
    padding: calc($spacing-3xl + $spacing-xl) $spacing-lg;
  }
}

.blog-hero__container {
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

.blog-hero__heading {
  display: flex;
  flex-direction: column;
}

.blog-hero__eyebrow {
  @include eyebrow;
  margin: 0 0 $spacing-sm;
}

.blog-hero__title {
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

.blog-hero__hairline {
  @include hairline($color-fjord, 1px);
  display: block;
  width: 48px;
  margin-top: $spacing-md;
}

.blog-hero__subtitle {
  @include reading-column;
  font-size: $font-size-lg;
  color: $color-ink-soft;
  line-height: $line-height-relaxed;
  margin: 0;

  @include tablet {
    font-size: $font-size-xl;
  }
}

// --- Articles Section ---
.blog-articles {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-canvas;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

.blog-articles__header {
  margin-bottom: $spacing-2xl;
  display: flex;
  flex-direction: column;

  @include tablet {
    margin-bottom: $spacing-3xl;
  }
}

.blog-articles__eyebrow {
  @include eyebrow;
  margin: 0 0 $spacing-sm;
}

.blog-articles__title {
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

.blog-articles__hairline {
  @include hairline($color-fjord, 1px);
  display: block;
  width: 48px;
  margin-top: $spacing-md;
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

// --- Error State ---
.blog-error {
  text-align: left;
  padding: $spacing-2xl;
  background-color: $color-danger-bg;
  border: 1px solid $color-danger-border;
  border-radius: $border-radius-base;
}

.blog-error__text {
  color: $color-danger-text;
  font-size: $font-size-lg;
  margin: 0 0 $spacing-md;
}

.blog-error__button {
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
.blog-empty {
  text-align: left;
  padding: $spacing-3xl $spacing-md;
}

.blog-empty__text {
  font-size: $font-size-lg;
  color: $color-stone;
  margin: 0;
}

// --- Social Section ---
.blog-social {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-canvas;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

.blog-social__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $spacing-md;
}

.blog-social__eyebrow {
  @include eyebrow;
  margin: 0;
}

.blog-social__title {
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

.blog-social__hairline {
  @include hairline($color-fjord, 1px);
  display: block;
  width: 48px;
  margin: $spacing-sm auto $spacing-lg;
}

// --- Accessibility ---
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
  .blog-error__button {
    transition: none;

    &:hover {
      transform: none;
    }
  }
}
</style>
