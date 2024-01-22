import { resolve, dirname } from "node:path";
import { fileURLToPath } from "url";
import VueI18nVitePlugin from "@intlify/unplugin-vue-i18n/vite";
import { v4 as uuidv4 } from "uuid";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  extends: ["termportal-ui"],
  modules: [
    "@nuxt/content",
    // "@nuxtjs/html-validator",
    // "@unlighthouse/nuxt",
  ],
  app: {
    head: {
      title: "Termportalen",
      link: [{ rel: "icon", type: "image/svg", href: "/favicon.svg" }],
    },
  },
  routeRules: {
    "/": { ssr: false },
    "/api/**": {
      cors: true,
      headers: {
        "Access-Control-Allow-Methods": "GET, POST",
      },
    },
  },
  appConfig: {},
  runtimeConfig: {
    apiKey: uuidv4(),
    endpointUrl: "https://test.sparql.terminologi.ubbe.no/termwiki_test?query",
    public: {
      base: "http://test.wiki.terminologi.no/index.php/Special:URIResolver/",
    },
  },
  nitro: {
    preset: "vercel",
  },
  vite: {
    plugins: [
      VueI18nVitePlugin({
        include: [
          resolve(dirname(fileURLToPath(import.meta.url)), "./locales/*.json"),
        ],
      }),
    ],
    // https://github.com/nuxt/nuxt/issues/24901
    define: {
      __NUXT_ASYNC_CONTEXT__: false,
    },
  },
  content: {
    sources: {
      github: {
        driver: "github",
        repo: "uib-ub/terminologi-content",
        branch: "main",
        dir: "web",
      },
    },
  },
  // htmlValidator: {
  //  usePrettier: true,
  //  logLevel: "verbose",
  //  failOnError: false,
  // },
});
