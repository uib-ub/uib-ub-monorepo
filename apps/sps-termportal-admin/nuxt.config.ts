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
    // ... options
  },
  sanity: { projectId: "k38biek5", dataset: "production" },
  routeRules: {
    "/studio/**": { ssr: false },
  },
});
