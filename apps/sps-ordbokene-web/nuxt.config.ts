import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import VueI18nVitePlugin from '@intlify/unplugin-vue-i18n/vite'

const locales = ["nob", "nno", "eng", "ukr"]
const optionalLocale = "/:locale(" + locales.join("|") + ")?"

export default defineNuxtConfig({
  css: [
    '~/assets/fonts/fonts.css',
  ],
  nitro: {
    preset: 'vercel',
    compressPublicAssets: true
  },
  runtimeConfig: {
    public: {
      endpointEnv: process.env.ENDPOINT_ENV || 'dev',
      versionWatermark: process.env.WATERMARK || 'test'
    }
  },

  build: {
		transpile: ["primevue"]
	},

  modules: [
      '@pinia/nuxt',
      '@pinia-plugin-persistedstate/nuxt',
      '@nuxtjs/tailwindcss',
      'nuxt-icon',
      '@nuxt/content'
    ],
  
  content: {
    sources: {
      github: {
        driver: "github",
        repo: "uib-ub/ordbokene-content",
        prefix: "/",
        dir: "content",
      },
    },
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
      pages.pop()
      pages.push({
        path: optionalLocale + '/',
        file: '~/pages/index.vue',
        children: [
          {
            name: 'index',
            path: '',
            file: '~/components/custom-pages/welcome-view.vue'
          }
        ]
      })

      pages.push({
            path: optionalLocale + '/:dict(bm|nn|bm,nn)',
            file: '~/pages/index.vue',
            children: [
              {
                name: 'article',
                path: ':article_id(\\d+)/:lemma?',
                file: '~/components/custom-pages/article-view.vue'
              },
              {
                name: 'word',
                path: ':q',
                file: '~/components/custom-pages/word-view.vue'
              },
              {
                name: 'welcome',
                path: '',
                alias: 'search', //legacy
                file: '~/components/custom-pages/welcome-view.vue'
              }

            ]
          })
      pages.push(
      {
        name: 'about',
        path: optionalLocale + '/about',
        file: '~/components/custom-pages/content-container.vue',
        children: [
          {
            name: 'about-slug',
            path: ':slug',
            file: '~/components/custom-pages/content-subpage.vue'
          },
          {
            name: 'about',
            path: '',
            file: '~/components/custom-pages/content-accordions.vue'
          }
          

        ]
      })
      pages.push({
        name: 'help',
        path: optionalLocale + '/help',
        file: '~/components/custom-pages/content-container.vue',
        children: [
          {
            name: 'help-slug',
            path: ':slug',
            file: '~/components/custom-pages/content-subpage.vue'
          },
          {
            name: 'help',
            path: '',
            file: '~/components/custom-pages/content-accordions.vue'
          }
        ]
        })

        pages.push({
          name: 'contact',
          path: optionalLocale + '/contact',
          file: '~/components/custom-pages/content-container.vue',
          children: [
            {
              name: 'contact',
              path: '',
              file: '~/components/custom-pages/contact-view.vue'
            }
          ]
      })

      pages.push(
      {
        name: 'settings',
        path: optionalLocale + '/settings',
        file: '~/components/custom-pages/settings.vue',
      })

      pages.push({
        name: 'search',
        path: optionalLocale +'/search',
        file: '~/components/custom-pages/search.vue',
      })

      pages.push({
        path: optionalLocale,
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

  ],
  },
  devtools: false
})