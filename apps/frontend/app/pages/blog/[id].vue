<script setup lang="ts">
import type { BlogArticle } from '~/types/blog-article'

const route = useRoute()
const articleId = route.params.id as string

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

const { data: article, error, pending: loading } = await useAsyncData(
  `blog-article-${articleId}`,
  () => $fetch<BlogArticle>(`${getApiUrl()}/blog/${articleId}`),
  { server: true }
)

const coverImage = computed(() => {
  if (!article.value) return null
  const cover = article.value.images.find((img) => img.isCover)
  return cover || article.value.images[0] || null
})

const galleryImages = computed(() => {
  if (!article.value) return []
  return article.value.images
    .filter((img) => img !== coverImage.value)
    .sort((a, b) => a.sortOrder - b.sortOrder)
})

const formattedDate = computed(() => {
  if (!article.value?.publishedAt) return null
  return new Date(article.value.publishedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const sanitizedContent = computed(() => {
  if (!article.value) return ''
  return sanitizeHtml(article.value.content)
})

useHead({
  title: () => article.value?.title || 'Article',
})

useSeoMeta({
  title: () => `${article.value?.title || 'Article'} | Atelier Kaisla`,
  description: () => {
    if (!article.value) return ''
    const stripped = article.value.content.replace(/<[^>]*>/g, '')
    return stripped.substring(0, 160).trimEnd()
  },
  ogTitle: () => `${article.value?.title || 'Article'} | Atelier Kaisla`,
  ogDescription: () => {
    if (!article.value) return ''
    const stripped = article.value.content.replace(/<[^>]*>/g, '')
    return stripped.substring(0, 160).trimEnd()
  },
  ogImage: () => coverImage.value?.url || '/logo-kaisla.png',
  ogUrl: () => `https://atelier-kaisla.com/blog/${articleId}`,
  twitterTitle: () => `${article.value?.title || 'Article'} | Atelier Kaisla`,
  twitterDescription: () => {
    if (!article.value) return ''
    const stripped = article.value.content.replace(/<[^>]*>/g, '')
    return stripped.substring(0, 160).trimEnd()
  },
  twitterImage: () => coverImage.value?.url || '/logo-kaisla.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="blog-detail">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="blog-detail__loading"
      role="status"
      aria-label="Chargement de l'article"
    >
      <div class="container">
        <p class="blog-detail__loading-text">Chargement...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="blog-detail__error"
      role="alert"
    >
      <div class="container">
        <p class="blog-detail__error-text">
          Impossible de charger l'article. Veuillez réessayer plus tard.
        </p>
        <NuxtLink
          to="/blog"
          class="blog-detail__back-link"
        >
          &larr; Retour au blog
        </NuxtLink>
      </div>
    </div>

    <!-- Article Content -->
    <template v-else-if="article">
      <!-- Header -->
      <header class="blog-detail__header">
        <div class="container">
          <NuxtLink
            to="/blog"
            class="blog-detail__back-link"
          >
            &larr; Retour au blog
          </NuxtLink>

          <h1 class="blog-detail__title">{{ article.title }}</h1>

          <p
            v-if="article.subtitle"
            class="blog-detail__subtitle"
          >
            {{ article.subtitle }}
          </p>

          <div class="blog-detail__meta">
            <time
              v-if="formattedDate"
              class="blog-detail__date"
              :datetime="article.publishedAt!"
            >
              {{ formattedDate }}
            </time>

            <div
              v-if="article.tags.length > 0"
              class="blog-detail__tags"
            >
              <span
                v-for="tag in article.tags"
                :key="tag.id"
                class="blog-detail__tag"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- Cover Image -->
      <section
        v-if="coverImage"
        class="blog-detail__cover"
      >
        <div class="container">
          <figure class="blog-detail__cover-figure">
            <img
              :src="coverImage.url"
              :alt="coverImage.altText || article.title"
              class="blog-detail__cover-image"
              decoding="async"
            />
          </figure>
        </div>
      </section>

      <!-- Article Body -->
      <section class="blog-detail__body">
        <div class="container">
          <div
            class="blog-detail__content"
            v-html="sanitizedContent"
          />
        </div>
      </section>

      <!-- Gallery -->
      <section
        v-if="galleryImages.length > 0"
        class="blog-detail__gallery"
        aria-labelledby="gallery-heading"
      >
        <div class="container">
          <h2
            id="gallery-heading"
            class="visually-hidden"
          >
            Galerie d'images
          </h2>
          <div class="blog-detail__gallery-grid">
            <figure
              v-for="image in galleryImages"
              :key="image.id"
              class="blog-detail__gallery-item"
            >
              <img
                :src="image.url"
                :alt="image.altText || article.title"
                class="blog-detail__gallery-image"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </div>
      </section>

      <!-- Back Navigation -->
      <nav class="blog-detail__nav">
        <div class="container">
          <NuxtLink
            to="/blog"
            class="blog-detail__back-link"
          >
            &larr; Retour au blog
          </NuxtLink>
        </div>
      </nav>

      <!-- Social Section -->
      <section
        class="blog-detail__social"
        aria-labelledby="blog-detail-social-title"
      >
        <div class="container">
          <h2
            id="blog-detail-social-title"
            class="visually-hidden"
          >
            Suivez-nous et contactez-nous
          </h2>
          <SocialShare />
        </div>
      </section>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.blog-detail {
  min-height: calc(100vh - $navbar-height);
  background-color: $color-white;
}

.container {
  @include container;
}

// Header
.blog-detail__header {
  padding: $spacing-2xl $spacing-md $spacing-xl;
  max-width: $container-content-width;
  margin: 0 auto;

  @include tablet {
    padding: $spacing-3xl $spacing-lg $spacing-xl;
  }
}

.blog-detail__back-link {
  display: inline-block;
  font-size: $font-size-base;
  color: $color-gray-600;
  text-decoration: none;
  margin-bottom: $spacing-lg;
  transition: color $transition-base;

  &:hover {
    color: $color-black;
  }

  @include focus-visible;
}

.blog-detail__title {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $color-black;
  margin: 0 0 $spacing-sm;
  line-height: $line-height-tight;

  @include tablet {
    font-size: $font-size-3xl;
  }

  @include desktop {
    font-size: $font-size-4xl;
  }
}

.blog-detail__subtitle {
  font-size: $font-size-lg;
  color: $color-gray-600;
  line-height: $line-height-base;
  margin: 0 0 $spacing-md;

  @include tablet {
    font-size: $font-size-xl;
  }
}

.blog-detail__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-sm;
}

.blog-detail__date {
  font-size: $font-size-base;
  color: $color-gray-600;
}

.blog-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.blog-detail__tag {
  display: inline-block;
  padding: 2px $spacing-xs;
  font-size: 0.75rem;
  font-weight: 500;
  color: $color-gray-600;
  background-color: $color-gray-100;
  border-radius: calc($border-radius-base / 2);
}

// Cover Image
.blog-detail__cover {
  margin-bottom: $spacing-xl;

  @include tablet {
    margin-bottom: $spacing-2xl;
  }
}

.blog-detail__cover-figure {
  margin: 0;
  max-width: $container-content-width;
  margin-left: auto;
  margin-right: auto;
  border-radius: $border-radius-base;
  overflow: hidden;
}

.blog-detail__cover-image {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

// Article Body
.blog-detail__body {
  padding: 0 $spacing-md $spacing-2xl;

  @include tablet {
    padding: 0 $spacing-lg $spacing-3xl;
  }
}

.blog-detail__content {
  max-width: $container-content-width;
  margin: 0 auto;
  font-size: $font-size-base;
  color: $color-gray-900;
  line-height: $line-height-base;

  @include tablet {
    font-size: $font-size-lg;
  }

  :deep(p) {
    margin: 0 0 $spacing-md;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(h2) {
    font-size: $font-size-xl;
    font-weight: 700;
    color: $color-black;
    margin: $spacing-xl 0 $spacing-sm;
    line-height: $line-height-tight;

    @include tablet {
      font-size: $font-size-2xl;
    }
  }

  :deep(h3) {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $color-black;
    margin: $spacing-lg 0 $spacing-xs;
    line-height: $line-height-tight;

    @include tablet {
      font-size: $font-size-xl;
    }
  }

  :deep(strong) {
    font-weight: 700;
  }

  :deep(em) {
    font-style: italic;
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 $spacing-md;
    padding-left: $spacing-lg;
  }

  :deep(li) {
    margin-bottom: $spacing-xs;
  }

  :deep(a) {
    color: $color-black;
    text-decoration: underline;
    transition: color $transition-base;

    &:hover {
      color: $color-gray-600;
    }
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid $color-gray-200;
    margin: $spacing-xl 0;
  }
}

// Gallery
.blog-detail__gallery {
  padding: 0 $spacing-md $spacing-2xl;

  @include tablet {
    padding: 0 $spacing-lg $spacing-3xl;
  }
}

.blog-detail__gallery-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-md;
  max-width: $container-content-width;
  margin: 0 auto;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-lg;
  }

  @include desktop {
    grid-template-columns: repeat(3, 1fr);
  }
}

.blog-detail__gallery-item {
  margin: 0;
  border-radius: $border-radius-base;
  overflow: hidden;
}

.blog-detail__gallery-image {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  transition: transform $transition-slow;

  &:hover {
    transform: scale(1.03);
  }
}

// Navigation
.blog-detail__nav {
  padding: 0 $spacing-md $spacing-xl;

  @include tablet {
    padding: 0 $spacing-lg $spacing-2xl;
  }
}

// Social
.blog-detail__social {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-white;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

// Loading
.blog-detail__loading {
  padding: $spacing-3xl $spacing-md;
  text-align: center;
}

.blog-detail__loading-text {
  font-size: $font-size-lg;
  color: $color-gray-600;
  margin: 0;
}

// Error
.blog-detail__error {
  padding: $spacing-3xl $spacing-md;
  text-align: center;
}

.blog-detail__error-text {
  font-size: $font-size-lg;
  color: $color-gray-600;
  margin: 0 0 $spacing-lg;
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
