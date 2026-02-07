// Nuxt auto-import shim for vitest
// Provides the same globals that Nuxt auto-imports in real app code

export { ref, computed, readonly, watch, onMounted, type Ref } from 'vue'
export const useRuntimeConfig = () => ({
  public: { apiUrl: 'http://localhost:4000/api' },
})
export const navigateTo = vi.fn()
export const useSeoMeta = vi.fn()
export const useHead = vi.fn()
