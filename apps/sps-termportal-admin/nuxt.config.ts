// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ["./../sps-termportal-base"],
  devtools: { enabled: true },
  modules: ["@sidebase/nuxt-auth"],
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
});
