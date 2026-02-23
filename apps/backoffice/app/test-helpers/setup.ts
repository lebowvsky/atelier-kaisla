/**
 * Vitest global setup file.
 *
 * Nuxt auto-imports (ref, computed, watch, etc.) are not available in vitest
 * unless we register them as globals. This file bridges that gap.
 */
import { ref, computed, readonly, watch, onMounted, reactive, toRef, toRefs, nextTick } from 'vue'
import type { Ref } from 'vue'
import { vi } from 'vitest'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as Record<string, any>

// --- Vue reactivity globals (Nuxt auto-imports these) ---
g.ref = ref
g.computed = computed
g.readonly = readonly
g.watch = watch
g.onMounted = onMounted
g.reactive = reactive
g.toRef = toRef
g.toRefs = toRefs
g.nextTick = nextTick

// Make the Ref type available (used in type annotations)
g.Ref = undefined // Type-only, not needed at runtime

// --- Nuxt-specific globals ---
g.useRuntimeConfig = () => ({
  public: { apiUrl: 'http://localhost:4000/api' },
})
g.navigateTo = vi.fn()
g.useSeoMeta = vi.fn()
g.useHead = vi.fn()
g.definePageMeta = vi.fn()

// --- import.meta stubs ---
// import.meta.client and import.meta.server are Nuxt-specific
// They are compile-time constants; we default to client=true, server=false
// These are set via define in vitest config, but as a fallback:
if (typeof import.meta.client === 'undefined') {
  Object.defineProperty(import.meta, 'client', { value: true, writable: true })
}
if (typeof import.meta.server === 'undefined') {
  Object.defineProperty(import.meta, 'server', { value: false, writable: true })
}
