// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ["termportal-ui"],
  modules: ["@sidebase/nuxt-auth", "@nuxt/content", "@nuxtjs/sanity", "@nuxt/eslint", "@nuxt/icon"],
  ssr: false,
  devtools: { enabled: true },
  app: {
    head: {
      title: "Termportalen admin",
      link: [{ rel: "icon", type: "image/svg", href: "/favicon.svg" }],
    },
  },
  content: {
    experimental: {
      sqliteConnector: "native",
    },
    build: {
      markdown: {
        remarkPlugins: {
          "remark-emoji": false,
        },
      },
    },
    sources: {
      //   content: {
      //     driver: "fs",
      //     prefix: "/docs", // All contents inside this source will be prefixed with `/docs`
      //     base: resolve(__dirname, "content"),
      //   },
      github: {
        // prefix: "/remote",
        driver: "github",
        repo: "uib-ub/terminologi-content",
        branch: "main",
        dir: "admin",
      },
    },
  },
  runtimeConfig: {
    auth: {
      secret: "",
    },
    dataportenClientId: "",
    dataportenClientSecret: "",
    dataportenAuthorizedUsers: process.env.NUXT_DATAPORTEN_AUTHORIZED_USERS,
    fuseki: {
      default: {
        url: process.env.NUXT_ENDPOINT_URL,
        user: process.env.NUXT_ENDPOINT_USER,
        pass: process.env.NUXT_ENDPOINT_URL_PASS,
      },
      internal: {
        url: process.env.NUXT_ENDPOINT_URL_INTERNAL,
        user: process.env.NUXT_ENDPOINT_INTERNAL_USER,
        pass: process.env.NUXT_ENDPOINT_URL_INTERNAL_PASS,
      },
    },
    elasticsearchUrl: process.env.NUXT_ELASTICSEARCH_URL,
    elasticsearchApiKey: process.env.NUXT_ELASTICSEARCH_API_KEY,
    public: {
      base: "http://test.wiki.terminologi.no/index.php/Special:URIResolver/",
    },
  },
  routeRules: {
    "/studio/**": { ssr: false },
    "/api/**": {
      cors: true,
      headers: {
        "Access-Control-Allow-Methods": "GET, POST",
      },
    },
    "/api/tb/**": {
      headers: {
        "Cache-Control":
          "max-age=600, s-maxage=7200, stale-while-revalidate=36000",
      },
    },
    "/api/domain/**": {
      headers: {
        "Cache-Control":
          "max-age=600, s-maxage=7200, stale-while-revalidate=36000",
      },
    },
  },
  nitro: {
    preset: "vercel",
  },
  vite: {
    define: {
      __NUXT_ASYNC_CONTEXT__: false,
    },
  },
  auth: {
    globalAppMiddleware: true,
    isEnabled: true,
    disableServerSideAuth: false,
    originEnvKey: process.env.AUTH_ORIGIN,
  },
  sanity: {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: "production",
    apiVersion: "2023-10-09",
    token: process.env.SANITY_API_TOKEN,
    useCdn: true,
  },
});
