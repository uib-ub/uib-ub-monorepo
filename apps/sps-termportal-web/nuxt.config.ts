import { resolve, dirname } from "node:path";
import { fileURLToPath } from "url";
import VueI18nVitePlugin from "@intlify/unplugin-vue-i18n/vite";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  meta: { title: "Termportalen" },
  modules: ["@nuxtjs/tailwindcss", "nuxt-icon", '@vueuse/nuxt'],
  buildModules: ["@nuxtjs/html-validator", "@unlighthouse/nuxt"],
  content: {
    // https://content.nuxtjs.org/api/configuration
  },
  runtimeConfig: {
    public: {
      endpointUrl: "https://sparql.terminologi.no/termwiki_test/query",
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
