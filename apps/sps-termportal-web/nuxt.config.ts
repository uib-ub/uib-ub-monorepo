import { resolve, dirname } from "node:path";
import { fileURLToPath } from "url";
import VueI18nVitePlugin from "@intlify/unplugin-vue-i18n/vite";
import { v4 as uuidv4 } from "uuid";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  extends: ["termportal-ui"],
  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxtjs/sanity",
    "@nuxtjs/tailwindcss",],
  ssr: false,
  app: {
    head: {
      title: "Termportalen",
      link: [{ rel: "icon", type: "image/svg", href: "/favicon.svg" }],
    },
  },
  content: {
    experimental: {
      sqliteConnector: "native"
    },
    build: {
      markdown: {
        remarkPlugins: {
          'remark-emoji': false
        }}},

    sources: {
      content: {
        driver: "fs",
        prefix: "/docs", // All contents inside this source will be prefixed with `/docs`
        base: resolve(__dirname, "content"),
      },
      github: {
        driver: "github",
        repo: "uib-ub/terminologi-content",
        branch: "main",
        dir: "web",
      },
    },
  },
  runtimeConfig: {
    apiKey: uuidv4(),
    fuseki: {
      url: process.env.NUXT_ENDPOINT_URL,
      user: process.env.NUXT_ENDPOINT_USER,
      pass: process.env.NUXT_ENDPOINT_URL_PASS,
    },
    elasticsearchUrl: process.env.NUXT_ELASTICSEARCH_URL,
    elasticsearchApiKey: process.env.NUXT_ELASTICSEARCH_API_KEY,
    public: {
      base: "http://test.wiki.terminologi.no/index.php/Special:URIResolver/",
    },
  },
  routeRules: {
    // "/": { ssr: false },
    // "/search": { ssr: false },
    // "/tb": { ssr: false },
    // "/termbase": { ssr: false },
    // "/om": { ssr: false },
    // "/innstillinger": { ssr: false },
    "/api/**": {
      cors: true,
      headers: {
        "Access-Control-Allow-Methods": "GET, POST",
        "Cache-Control":
          "max-age=600, s-maxage=3600, stale-while-revalidate=7200",
      },
    },
    "/api/search/**": {
      headers: { "Cache-Control": "no-store" },
    },
    "/api/search/autocomplete/**": {
      cors: true,
      headers: {
        "Cache-Control":
          "max-age=600, s-maxage=3600, stale-while-revalidate=7200",
      },
    },
    "/ARTSDB": { redirect: "/tb/ARTSDB" },
    "/BIBINF": { redirect: "/tb/BIBINF" },
    "/EVERTEBRATER": { redirect: "/tb/EVERTEBRATER" },
    "/FBK": { redirect: "/tb/FBK" },
    "/KLIMA": { redirect: "/tb/KLIMA" },
    "/LINGVISTIKK": { redirect: "/tb/LINGVISTIKK" },
    "/MRT": { redirect: "/tb/MRT" },
    "/NHH": { redirect: "/tb/NHH" },
    "/NOT": { redirect: "/tb/NOT" },
    "/NOJU": { redirect: "/tb/NOJU" },
    "/ROMFYS": { redirect: "/tb/ROMFYS" },
    "/SEMANTIKK": { redirect: "/tb/SEMANTIKK" },
    "/SDIR": { redirect: "/tb/SDIR" },
    "/SKOG": { redirect: "/tb/SKOG" },
    "/SNOMEDCT": { redirect: "/tb/SNOMEDCT" },
    "/SVV": { redirect: "/tb/SVV" },
    "/ASTRONOMI": { redirect: "/tb/ASTRONOMI" },
    "/CMBIOLOGI": { redirect: "/tb/CMBIOLOGI" },
    "/KJEMI": { redirect: "/tb/KJEMI" },
    "/TOT": { redirect: "/tb/TOT" },
    "/TOLKING": { redirect: "/tb/TOLKING" },
    "/RTT": { redirect: "/tb/RTT" },
    "/UDEUT": { redirect: "/tb/UDEUT" },
    "/UHR": { redirect: "/tb/UHR" },
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
    // define: {
    //   __NUXT_ASYNC_CONTEXT__: false,
    // },
  },
  sanity: {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: "production",
    apiVersion: "2023-10-09",
    token: process.env.SANITY_API_TOKEN,
    useCdn: true,
  },
  // htmlValidator: {
  //  usePrettier: true,
  //  logLevel: "verbose",
  //  failOnError: false,
  // },
});