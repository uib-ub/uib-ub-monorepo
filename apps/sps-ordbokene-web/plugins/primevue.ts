import PrimeVue from "primevue/config";
import Menu from "primevue/menu";
// import Tooltip from 'primevue/tooltip';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: false });
  nuxtApp.vueApp.component("Menu", Menu);
  // nuxtApp.vueApp.directive('tooltip', Tooltip);
});
