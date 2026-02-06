<!--
  @pattern Template Method Pattern
  @purpose Authentication layout for login page
  @description Minimal layout without sidebar, only for auth pages
-->

<script setup lang="ts">
/**
 * Authentication layout - minimal design for login/register pages
 * No navigation, no sidebar, just centered content
 */
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-4">
      <div class="flex items-center gap-2">
        <!-- Logo -->
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xl shadow-md">
          AK
        </div>
        <div class="hidden sm:block">
          <h1 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Atelier Kaisla
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Backoffice
          </p>
        </div>
      </div>
    </header>

    <!-- Main Content - Centered -->
    <main class="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="fixed bottom-0 left-0 right-0 px-6 py-4 text-center">
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Atelier Kaisla &copy; {{ new Date().getFullYear() }}
      </p>
    </footer>
  </div>
</template>

<style scoped>
/**
 * Layout-specific styles
 * Ensures proper spacing and centered content
 */
main {
  min-height: calc(100vh - 8rem);
}
</style>
