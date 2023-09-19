import { resolve, dirname } from "node:path";
import { fileURLToPath } from "url";
import VueI18nVitePlugin from "@intlify/unplugin-vue-i18n/vite";
import { v4 as uuidv4 } from "uuid";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  app: {
    head: {
      link: [{ rel: "icon", type: "image/svg", href: "/favicon.svg" }],
    },
  },
  meta: { title: "Termportalen" },
  extends: ["nuxt-umami"],
  css: ["assets/tp-theme/theme.scss"],
  build: {
    transpile: ["primevue"],
  },
  modules: ["@nuxtjs/tailwindcss", "nuxt-icon", "@vueuse/nuxt"],
  buildModules: ["@nuxtjs/html-validator", "@unlighthouse/nuxt"],
  content: {
    // https://content.nuxtjs.org/api/configuration
  },
  routeRules: {
    "/api/**": {
      cors: true,
      headers: {
        "Access-Control-Allow-Methods": "GET, POST",
      },
    },
  },
  appConfig: {
    umami: {
      version: 2,
      ignoreLocalhost: true,
    },
  },
  runtimeConfig: {
    apiKey: uuidv4(),
    endpointUrl: "https://test.sparql.terminologi.ubbe.no/termwiki_test?query",
    public: {
      base: "http://test.wiki.terminologi.no/index.php/Special:URIResolver/",
    },
  },
  vite: {
    plugins: [
      VueI18nVitePlugin({
        include: [
          resolve(dirname(fileURLToPath(import.meta.url)), "./locales/*.json"),
        ],
      }),
    ],
  },
  htmlValidator: {
    usePrettier: true,
    logLevel: "verbose",
    failOnError: false,
  },
});
