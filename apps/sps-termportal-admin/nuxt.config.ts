// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ["./../sps-termportal-base"],
  devtools: { enabled: true },
  modules: ["@sidebase/nuxt-auth"],
  runtimeConfig: {
    auth: {
      //   origin: process.env.AUTH_ORIGIN,
      secret: "",
    },
    dataportenClientId: "",
    dataportenClientSecret: "",
    dataportenAuthorizedUsers:
      process.env.NUXT_DATAPORTEN_AUTHORIZED_USERS?.split(", "),
  },
  auth: {
    globalAppMiddleware: true,
  },
  nitro: {
    preset: "vercel",
  },
});
