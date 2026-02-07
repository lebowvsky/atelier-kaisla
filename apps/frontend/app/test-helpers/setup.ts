/**
 * Vitest global setup file.
 *
 * Nuxt auto-imports (ref, computed, watch, etc.) are not available in vitest
 * unless we register them as globals. This file bridges that gap.
 */
import { ref, computed, readonly, watch, onMounted, reactive, toRef, toRefs, nextTick } from 'vue'
import { vi } from 'vitest'

// --- Vue reactivity globals (Nuxt auto-imports these) ---
;(globalThis as any).ref = ref
;(globalThis as any).computed = computed
;(globalThis as any).readonly = readonly
;(globalThis as any).watch = watch
;(globalThis as any).onMounted = onMounted
;(globalThis as any).reactive = reactive
;(globalThis as any).toRef = toRef
;(globalThis as any).toRefs = toRefs
;(globalThis as any).nextTick = nextTick

// Make the Ref type available (used in type annotations)
;(globalThis as any).Ref = undefined // Type-only, not needed at runtime

// --- Nuxt-specific globals ---
;(globalThis as any).useRuntimeConfig = () => ({
  public: { apiUrl: 'http://localhost:4000/api' },
})
;(globalThis as any).navigateTo = vi.fn()
;(globalThis as any).useSeoMeta = vi.fn()
;(globalThis as any).useHead = vi.fn()
;(globalThis as any).definePageMeta = vi.fn()

// --- import.meta stubs ---
if (typeof import.meta.client === 'undefined') {
  Object.defineProperty(import.meta, 'client', { value: true, writable: true })
}
if (typeof import.meta.server === 'undefined') {
  Object.defineProperty(import.meta, 'server', { value: false, writable: true })
}
