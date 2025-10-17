export default defineNuxtConfig({
  build: {
    transpile: ["primevue"],
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "@vueuse/nuxt",
    "@nuxt/icon",
  ],
  css: ["termportal-ui/assets/tp-theme/theme.scss"],
});