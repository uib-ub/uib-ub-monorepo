import { resolve, dirname } from "node:path";
import { fileURLToPath } from "url";
import VueI18nVitePlugin from "@intlify/unplugin-vue-i18n/vite";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  meta: { title: "Termportalen" },
  extends: ["nuxt-umami"],
  modules: [
    "@nuxtjs/tailwindcss",
    "nuxt-icon",
    "@vueuse/nuxt",
    "@sidebase/nuxt-session",
  ],
  buildModules: ["@nuxtjs/html-validator", "@unlighthouse/nuxt"],
  content: {
    // https://content.nuxtjs.org/api/configuration
  },
  appConfig: {
    umami: {
      version: 2,
      ignoreLocalhost: true,
    },
  },
  runtimeConfig: {
    public: {
      endpointUrl:
        "https://test.sparql.terminologi.ubbe.no/termwiki_test?query",
      base: "http://test.wiki.terminologi.no/index.php/Special:URIResolver/",
    },
  },
  session: {
    // Module is enabled
    isEnabled: true,
    session: {
      // Sessions expire after 600 seconds = 10 minutes
      expiryInSeconds: 60 * 5,
      // The session cookie same site policy is `lax`
      cookieSameSite: "strict",
      // The request-domain is strictly used for the cookie, no sub-domains allowed
      domain: true, // fixed
      // Sessions aren't pinned to the user's IP address
      ipPinning: true, // fixed
      // Expiration of the sessions are not reset to the original expiryInSeconds on every request
      rolling: false,
    },
    api: {
      // The API is enabled
      isEnabled: false,
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
