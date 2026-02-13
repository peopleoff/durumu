export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: {
    compatibilityVersion: 4,
  },
  ssr: false,
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Durumu Light Spectrum Trainer',
      meta: [
        { name: 'description', content: 'Practice the Light Spectrum (Colorblind) phase from Durumu the Forgotten - Throne of Thunder' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#0a0a12' },
      ],
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
})
