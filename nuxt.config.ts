export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  future: {
    compatibilityVersion: 4,
  },

  ssr: false,

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Durumu Light Spectrum Trainer',
      meta: [
        { name: 'description', content: 'Practice the Light Spectrum (Colorblind) phase from Durumu the Forgotten - Throne of Thunder' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#0a0a12' },
        { property: 'og:title', content: 'Durumu Light Spectrum Trainer' },
        { property: 'og:description', content: 'Practice mechanics so your raid leader won\'t hate you' },
        { property: 'og:image', content: '/og_image.png' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: '/og_image.png' },
      ],
      htmlAttrs: {
        lang: 'en',
      },
    },
  },

  modules: ['@nuxt/fonts'],

  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
    },
  },
})