import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import VueI18nVitePlugin from '@intlify/unplugin-vue-i18n/vite'

export default defineNuxtConfig({
  css: ['~/assets/fonts/fonts.css'],

  nitro: {
    compressPublicAssets: true,
  },
  runtimeConfig: {
    public: {
      endpointEnv: process.env.ENDPOINT_ENV || 'dev',
      versionWatermark: process.env.WATERMARK || 'test'
    }
  },

  modules: [
      '@pinia/nuxt',
      '@pinia-plugin-persistedstate/nuxt',
      '@nuxtjs/tailwindcss',
      'nuxt-icon'

    ],

  piniaPersistedstate: {
    cookieOptions: {
      sameSite: 'strict',
    }
  },

  hooks: {
    'pages:extend' (pages) {
      pages.push({
        path: '/:dict(bm|nn|bm,nn)',
        file: '~/custom-pages/view-container.vue',
        children: [
          {
            name: 'article',
            path: ':article_id(\\d+)/:lemma?',
            file: '~/custom-pages/article-view.vue'
          },
          {
            name: 'word',
            path: ':q',
            file: '~/custom-pages/word-view.vue'
          },
          {
            name: 'welcome',
            path: '',
            alias: 'search', //legacy
            file: '~/custom-pages/welcome-view.vue'
          }
        ]
      })
    }
  },

  vite: {
    resolve: {
      alias: {
        'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js'
      }
  },
  plugins: [
    VueI18nVitePlugin({
      include: [
        resolve(dirname(fileURLToPath(import.meta.url)), './locales/*.json')
      ]
    })
  ],
  i18n: {
    // ...
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',  // recommended
    }
  }
  },

  devtools: true
})