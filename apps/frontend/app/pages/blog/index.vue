<script setup lang="ts">
import type { BlogArticle } from '~/types/blog-article'

const { apiFetch } = useApi()

const { content: heroContent, isEmpty: heroIsEmpty, fetchSection: fetchHero } = usePageContent('blog', 'hero')
const { content: articlesContent, isEmpty: articlesIsEmpty, fetchSection: fetchArticles } = usePageContent('blog', 'articles')
const { content: socialContent, isEmpty: socialIsEmpty, fetchSection: fetchSocial } = usePageContent('blog', 'social')

const heroSubtitle = computed(() => sanitizeHtml(heroContent.value?.content ?? ''))

await Promise.all([
  fetchHero(),
  fetchArticles(),
  fetchSocial(),
])

const { data: articles, error, pending: loading } = await useAsyncData(
  'blog-articles',
  () => apiFetch<BlogArticle[]>('/blog'),
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
      v-if="!heroIsEmpty"
      class="blog-hero"
      aria-labelledby="blog-hero-title"
    >
      <div class="container blog-hero__container" lang="fr">
        <div class="blog-hero__heading">
          <span v-if="heroContent?.eyebrow" class="blog-hero__eyebrow">{{ heroContent.eyebrow }}</span>
          <h1
            v-if="heroContent?.title"
            id="blog-hero-title"
            class="blog-hero__title"
          >
            {{ heroContent.title }}
          </h1>
          <span class="blog-hero__hairline" aria-hidden="true" />
        </div>
        <div v-if="heroSubtitle" class="blog-hero__subtitle" v-html="heroSubtitle" />
      </div>
    </section>

    <!-- Articles Section -->
    <section
      class="blog-articles"
      aria-labelledby="blog-articles-heading"
    >
      <div class="container">
        <header v-if="!articlesIsEmpty" class="blog-articles__header" lang="fr">
          <span v-if="articlesContent?.eyebrow" class="blog-articles__eyebrow">{{ articlesContent.eyebrow }}</span>
          <h2
            v-if="articlesContent?.title"
            id="blog-articles-heading"
            class="blog-articles__title"
          >
            {{ articlesContent.title }}
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
      class="blog-connect"
      aria-labelledby="blog-connect-title"
    >
      <div class="container blog-connect__container" lang="fr">
        <template v-if="!socialIsEmpty">
          <span v-if="socialContent?.eyebrow" class="blog-connect__eyebrow">{{ socialContent.eyebrow }}</span>
          <h2
            v-if="socialContent?.title"
            id="blog-connect-title"
            class="blog-connect__title"
          >
            {{ socialContent.title }}
          </h2>
          <span class="blog-connect__hairline" aria-hidden="true" />
        </template>
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
  @include hero-subtitle($font-size-lg, $font-size-xl);
  margin: 0;
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
.blog-connect {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-canvas;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

.blog-connect__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $spacing-md;
}

.blog-connect__eyebrow {
  @include eyebrow;
  margin: 0;
}

.blog-connect__title {
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

.blog-connect__hairline {
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
