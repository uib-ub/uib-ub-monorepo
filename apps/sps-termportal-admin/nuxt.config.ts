// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ["termportal-ui"],
  devtools: { enabled: true },
  modules: ["@sidebase/nuxt-auth", "@nuxt/content", "@nuxtjs/sanity"],
  app: {
    head: {
      title: "Termportalen admin",
      link: [{ rel: "icon", type: "image/svg", href: "/favicon.svg" }],
    },
  },
  runtimeConfig: {
    auth: {
      secret: "",
    },
    dataportenClientId: "",
    dataportenClientSecret: "",
    dataportenAuthorizedUsers:
      process.env.NUXT_DATAPORTEN_AUTHORIZED_USERS?.split(", "),
    endpointUrl: "",
    endpointUrlInternal: "",
    public: {
      base: "http://test.wiki.terminologi.no/index.php/Special:URIResolver/",
    },
  },
  auth: {
    globalAppMiddleware: true,
  },
  nitro: {
    preset: "vercel",
  },
  content: {
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
  sanity: {
    projectId: "k38biek5",
    dataset: "production",
    apiVersion: "2023-10-09",
    token: process.env.SANITY_API_TOKEN,
    useCdn: true,
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
          "max-age=600, s-maxage=3600, stale-while-revalidate=7200",
      },
    },
  },
  ssr: false,
  vite: {
    define: {
      __NUXT_ASYNC_CONTEXT__: false,
    },
  },
});
