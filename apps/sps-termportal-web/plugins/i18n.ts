import { createI18n } from "vue-i18n";
import en from "../locales/en.json";
import nb from "../locales/nb.json";
import nn from "../locales/nn.json";

export default defineNuxtPlugin(({ vueApp }) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: "nb",
    messages: {
      en,
      nb,
      nn,
    },
  });

  vueApp.use(i18n);
});
