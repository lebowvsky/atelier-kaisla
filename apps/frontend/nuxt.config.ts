// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/seo', '@nuxt/image', '@nuxt/fonts'],

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
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:4000/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://atelierkaisla.com'
    }
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://atelierkaisla.com',
    name: 'Atelier Kaisla',
    description: 'Atelier artisanal de tentures murales et tapis faits main, alliant matériaux naturels et design contemporain.',
    defaultLocale: 'fr'
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    autoLastmod: true,
    xsl: false,
    defaults: {
      changefreq: 'weekly',
      priority: 0.7
    },
    exclude: [
      '/social-demo',
      '/wall-hanging-example'
    ]
  },

  robots: {
    disallow: ['/admin'],
    sitemap: '/sitemap.xml'
  },

  schemaOrg: {
    identity: 'Organization'
  },

  ogImage: {
    enabled: false
  },

  image: {
    format: ['avif', 'webp'],
    quality: 85,
    densities: [1, 2],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    },
    domains: [
      'api.atelierkaisla.com',
      'api.lebowvsky.com',
      'localhost'
    ]
  }
})
