<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const isNotFound = computed(() => props.error.statusCode === 404)

const title = computed(() =>
  isNotFound.value ? 'Page introuvable' : 'Une erreur est survenue'
)

const description = computed(() =>
  isNotFound.value
    ? "Cette page n'existe pas ou a été déplacée. Retrouvez nos collections de tentures murales et tapis depuis l'accueil."
    : "Une erreur inattendue s'est produite. Merci de réessayer dans quelques instants."
)

useSeo({
  title: () => title.value,
  description: () => description.value,
  noindex: true
})

const handleClearError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="error-page">
    <main class="error-page__main">
      <div class="error-page__container" lang="fr">
        <p class="error-page__status">{{ error.statusCode }}</p>
        <h1 class="error-page__title">{{ title }}</h1>
        <span class="error-page__hairline" aria-hidden="true" />
        <p class="error-page__description">{{ description }}</p>
        <div class="error-page__actions">
          <button
            type="button"
            class="error-page__button"
            @click="handleClearError"
          >
            Retour à l'accueil
          </button>
          <NuxtLink to="/blog" class="error-page__link">
            Lire le journal
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $color-canvas;
}

.error-page__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-2xl $spacing-md;
}

.error-page__container {
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.error-page__status {
  @include eyebrow;
  margin: 0 0 $spacing-md;
}

.error-page__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-ink;
  letter-spacing: $letter-spacing-tight;
  margin: 0 0 $spacing-md;
  line-height: $line-height-tight;

  @include tablet {
    font-size: $font-size-3xl;
  }
}

.error-page__hairline {
  @include hairline($color-fjord, 48px);
  margin: 0 auto $spacing-md;
}

.error-page__description {
  font-size: $font-size-base;
  color: $color-ink-soft;
  line-height: $line-height-base;
  margin: 0 auto $spacing-xl;
  max-width: 62ch;

  @include tablet {
    font-size: $font-size-lg;
  }
}

.error-page__actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  align-items: center;

  @include tablet {
    flex-direction: row;
    justify-content: center;
    gap: $spacing-md;
  }
}

.error-page__button {
  display: inline-block;
  padding: $spacing-sm $spacing-lg;
  background-color: $color-ink;
  color: $color-canvas;
  border: none;
  font-family: inherit;
  font-size: $font-size-base;
  cursor: pointer;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform $transition-fast,
      box-shadow $transition-fast;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }
  }

  &:focus-visible {
    outline: 2px solid $color-fjord-deep;
    outline-offset: 4px;
  }
}

.error-page__link {
  position: relative;
  color: $color-ink;
  text-decoration: none;
  font-size: $font-size-base;
  padding: $spacing-sm $spacing-md;

  &::after {
    content: '';
    position: absolute;
    left: $spacing-md;
    right: $spacing-md;
    bottom: calc($spacing-sm - 2px);
    height: 1px;
    background-color: currentColor;

    @media (prefers-reduced-motion: no-preference) {
      transition: bottom $transition-fast;
    }
  }

  &:hover::after {
    bottom: calc($spacing-sm - 4px);
  }

  &:focus-visible {
    outline: 2px solid $color-fjord-deep;
    outline-offset: 2px;
    border-radius: 2px;
  }
}
</style>
