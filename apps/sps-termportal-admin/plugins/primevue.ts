import PrimeVue from "primevue/config";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Menu from "primevue/menu";
import OverlayPanel from "primevue/overlaypanel";
import RadioButton from "primevue/radiobutton";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import TreeTable from "primevue/treetable";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, { ripple: true });
  nuxtApp.vueApp.component("Accordion", Accordion);
  nuxtApp.vueApp.component("AccordionTab", AccordionTab);
  nuxtApp.vueApp.component("Button", Button);
  nuxtApp.vueApp.component("Dropdown", Dropdown);
  nuxtApp.vueApp.component("Menu", Menu);
  nuxtApp.vueApp.component("OverlayPanel", OverlayPanel);
  nuxtApp.vueApp.component("RadioButton", RadioButton);
  nuxtApp.vueApp.component("DataTable", DataTable);
  nuxtApp.vueApp.component("Column", Column);
  nuxtApp.vueApp.component("TreeTable", TreeTable);
});
