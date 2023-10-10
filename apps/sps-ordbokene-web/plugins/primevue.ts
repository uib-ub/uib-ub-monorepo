import PrimeVue from "primevue/config";
import Menu from "primevue/menu";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: false });
  nuxtApp.vueApp.component("Menu", Menu);

});