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
      <div class="error-page__container">
        <p class="error-page__status">{{ error.statusCode }}</p>
        <h1 class="error-page__title">{{ title }}</h1>
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
  background-color: $color-gray-100;
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
  font-size: 4rem;
  font-weight: 700;
  color: $color-gray-300;
  margin: 0 0 $spacing-sm;
  line-height: 1;

  @include tablet {
    font-size: 6rem;
  }
}

.error-page__title {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $color-black;
  margin: 0 0 $spacing-md;
  line-height: $line-height-tight;

  @include tablet {
    font-size: $font-size-3xl;
  }
}

.error-page__description {
  font-size: $font-size-base;
  color: $color-gray-600;
  line-height: $line-height-base;
  margin: 0 0 $spacing-xl;

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
  background-color: $color-black;
  color: $color-white;
  border: none;
  font-family: inherit;
  font-size: $font-size-base;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover,
  &:focus {
    background-color: $color-gray-900;
    transform: translateY(-2px);
  }

  &:focus {
    outline: 2px solid $color-black;
    outline-offset: 2px;
  }
}

.error-page__link {
  color: $color-black;
  text-decoration: underline;
  font-size: $font-size-base;
  padding: $spacing-sm $spacing-md;
  transition: opacity 0.2s ease;

  &:hover,
  &:focus {
    opacity: 0.7;
  }

  &:focus {
    outline: 2px solid $color-black;
    outline-offset: 2px;
  }
}
</style>
