import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  define: {
    'import.meta.client': true,
    'import.meta.server': false,
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['app/**/*.spec.ts'],
    setupFiles: [resolve(__dirname, 'app/test-helpers/setup.ts')],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'app'),
      '~': resolve(__dirname, 'app'),
      '#imports': resolve(__dirname, 'app/test-helpers/nuxt-imports.ts'),
    },
  },
})
