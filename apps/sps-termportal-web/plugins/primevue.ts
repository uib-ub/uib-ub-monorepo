import PrimeVue from "primevue/config";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Menu from "primevue/menu";
import OverlayPanel from "primevue/overlaypanel";
import RadioButton from "primevue/radiobutton";
import InputSwitch from "primevue/inputswitch";
import Paginator from "primevue/paginator";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true });
  nuxtApp.vueApp.component("Accordion", Accordion);
  nuxtApp.vueApp.component("AccordionTab", AccordionTab);
  nuxtApp.vueApp.component("Button", Button);
  nuxtApp.vueApp.component("Dropdown", Dropdown);
  nuxtApp.vueApp.component("InputSwitch", InputSwitch);
  nuxtApp.vueApp.component("Menu", Menu);
  nuxtApp.vueApp.component("OverlayPanel", OverlayPanel);
  nuxtApp.vueApp.component("RadioButton", RadioButton);
  nuxtApp.vueApp.component("Paginator", Paginator);
});
