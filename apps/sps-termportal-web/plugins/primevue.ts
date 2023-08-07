import PrimeVue from "primevue/config";
import Accordion from "primevue/accordion";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Menu from "primevue/menu";


export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true });
  nuxtApp.vueApp.component("Accordion", Accordion);
  nuxtApp.vueApp.component("Button", Button);
  nuxtApp.vueApp.component("Dropdown", Dropdown);
  nuxtApp.vueApp.component("Menu", Menu);
});
