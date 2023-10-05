import PrimeVue from "primevue/config";
import Button from "primevue/button";
import Menu from "primevue/menu";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: false });
  nuxtApp.vueApp.component("Button", Button);
  nuxtApp.vueApp.component("Menu", Menu);

});