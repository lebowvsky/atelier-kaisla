<script setup lang="ts">
import type { BlogArticle } from '~/types/blog-article'

interface Props {
  article: BlogArticle
}

const props = defineProps<Props>()

const coverImage = computed(() => {
  const cover = props.article.images.find((img) => img.isCover)
  return cover || props.article.images[0] || null
})

const excerpt = computed(() => {
  const stripped = props.article.content.replace(/<[^>]*>/g, '')
  return stripped.length > 120 ? stripped.substring(0, 120).trimEnd() + '...' : stripped
})

const formattedDate = computed(() => {
  if (!props.article.publishedAt) return null
  return new Date(props.article.publishedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})
</script>

<template>
  <article class="blog-card">
    <NuxtLink
      :to="`/blog/${article.id}`"
      class="blog-card__link"
      :aria-label="`Lire l'article : ${article.title}`"
    >
      <!-- Image -->
      <figure class="blog-card__figure">
        <div class="blog-card__image-container">
          <img
            v-if="coverImage"
            :src="coverImage.url"
            :alt="coverImage.altText || article.title"
            class="blog-card__image"
            loading="lazy"
            decoding="async"
          />
          <div
            v-else
            class="blog-card__image-placeholder"
          />
        </div>
      </figure>

      <!-- Content -->
      <div class="blog-card__content">
        <h3 class="blog-card__title">{{ article.title }}</h3>

        <p
          v-if="article.subtitle"
          class="blog-card__subtitle"
        >
          {{ article.subtitle }}
        </p>

        <p class="blog-card__excerpt">{{ excerpt }}</p>

        <!-- Tags -->
        <div
          v-if="article.tags.length > 0"
          class="blog-card__tags"
        >
          <span
            v-for="tag in article.tags"
            :key="tag.id"
            class="blog-card__tag"
          >
            {{ tag.name }}
          </span>
        </div>

        <!-- Date -->
        <time
          v-if="formattedDate"
          class="blog-card__date"
          :datetime="article.publishedAt!"
        >
          {{ formattedDate }}
        </time>
      </div>
    </NuxtLink>
  </article>
</template>

<style lang="scss" scoped>
.blog-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: $color-white;
  border-radius: $border-radius-base;
  overflow: hidden;
  transition:
    transform $transition-base,
    box-shadow $transition-base;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
}

.blog-card__link {
  display: flex;
  flex-direction: column;
  width: 100%;
  text-decoration: none;
  color: inherit;

  @include focus-visible;

  &:focus-visible {
    border-radius: $border-radius-base;
  }
}

// Image
.blog-card__figure {
  margin: 0;
  width: 100%;
  overflow: hidden;
  background-color: $color-gray-100;
}

.blog-card__image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
}

.blog-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform $transition-slow;

  .blog-card:hover & {
    transform: scale(1.05);
  }
}

.blog-card__image-placeholder {
  width: 100%;
  height: 100%;
  background-color: $color-gray-200;
}

// Content
.blog-card__content {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  padding: $spacing-md;
  flex: 1;
}

.blog-card__title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: 600;
  line-height: $line-height-tight;
  color: $color-gray-900;
  transition: color $transition-fast;

  .blog-card:hover & {
    color: $color-gray-600;
  }

  @include tablet {
    font-size: $font-size-xl;
  }
}

.blog-card__subtitle {
  margin: 0;
  font-size: $font-size-base;
  color: $color-gray-600;
  line-height: $line-height-base;
}

.blog-card__excerpt {
  margin: 0;
  font-size: $font-size-base;
  color: $color-gray-600;
  line-height: $line-height-base;
}

.blog-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  margin-top: $spacing-xs;
}

.blog-card__tag {
  display: inline-block;
  padding: 2px $spacing-xs;
  font-size: 0.75rem;
  font-weight: 500;
  color: $color-gray-600;
  background-color: $color-gray-100;
  border-radius: calc($border-radius-base / 2);
  line-height: 1.4;
}

.blog-card__date {
  margin-top: auto;
  padding-top: $spacing-xs;
  font-size: 0.875rem;
  color: $color-gray-600;
  font-weight: 400;
}

// Responsive
@include tablet {
  .blog-card__content {
    padding: $spacing-lg;
    gap: $spacing-xs;
  }
}
</style>
