import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import VueI18nVitePlugin from '@intlify/unplugin-vue-i18n/vite'

const locales = "/:locale(nob|nno|eng|ukr)?"
export default defineNuxtConfig({
  css: ['~/assets/fonts/fonts.css'],

  nitro: {
    preset: 'vercel',
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
      'nuxt-icon',
      '@nuxt/content'
    ],
  
  content: {
    markdown: {
      tags: {
        h1: "h2",
        h2: "h3",
        h3: "h4",
        h4: "h5",
      }
    }

  },

  piniaPersistedstate: {
    cookieOptions: {
      sameSite: 'strict',
    }
  },
  hooks: {
    'pages:extend' (pages) {
      pages.push({
            path: locales + '/:dict(bm|nn|bm,nn)',
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
      pages.push(
      {
        name: 'about',
        path: locales + '/about',
        file: '~/custom-pages/content-container.vue',
        children: [
          {
            name: 'about',
            path: '',
            file: '~/custom-pages/content-accordions.vue'
          },
          {
            name: 'about-slug',
            path: ':slug',
            file: '~/custom-pages/content-subpage.vue'
          }

        ]
      })
      pages.push({
        name: 'help',
        path: locales + '/help',
        file: '~/custom-pages/content-container.vue',
        children: [
          {
            name: 'help',
            path: '',
            file: '~/custom-pages/content-accordions.vue'
          },
          {
            name: 'help-slug',
            path: ':slug',
            file: '~/custom-pages/content-subpage.vue'
          }

        ]
        })
        pages.push({
          name: 'contact',
          path: locales + '/contact',
          file: '~/custom-pages/content-container.vue',
          children: [
            {
              name: 'contact',
              path: '',
              file: '~/custom-pages/content-accordions.vue'
            }
          ]
      })
      pages.push(
      {
        name: 'settings',
        path: locales + '/settings',
        file: '~/custom-pages/settings.vue',
      })
      pages.push({
        name: 'search',
        path: locales +'/search',
        file: '~/custom-pages/search.vue',
      })

      pages.push({
        path: locales,
        file: '~/pages/index.vue',
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
  ]
  },
  devtools: true
})