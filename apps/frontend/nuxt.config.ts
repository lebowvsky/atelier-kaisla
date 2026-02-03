// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/styles/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "~/assets/styles/_variables.scss"; @import "~/assets/styles/_mixins.scss";'
        }
      }
    }
  },

  runtimeConfig: {
    public: {
      // API URL - configurable via NUXT_PUBLIC_API_URL environment variable
      // In Docker: http://backend:4000/api
      // Local dev: http://localhost:4000/api
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:4000/api'
    }
  }
})
