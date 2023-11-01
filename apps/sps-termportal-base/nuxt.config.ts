export default defineNuxtConfig({
  build: {
    transpile: ["primevue"],
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "nuxt-icon",
    "@vueuse/nuxt",
    // "@nuxtjs/html-validator",
    // "@unlighthouse/nuxt",
  ],
  css: ["/../sps-termportal-base/assets/tp-theme/theme.scss"],
});
