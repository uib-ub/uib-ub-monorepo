import { createI18n } from "vue-i18n";
import en from "../locales/en.json";
import nb from "../locales/nb.json";
import nn from "../locales/nn.json";
import { LocalLangCode } from "~/composables/locale";
import { cookieLocaleOptions } from "~/utils/vars";

export default defineNuxtPlugin(({ vueApp }) => {
  const cookie = useCookie("locale", cookieLocaleOptions);
  const locale: LocalLangCode = (cookie.value as LocalLangCode) || "nb";
  cookie.value = "";
  cookie.value = locale;

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale,
    messages: {
      en,
      nb,
      nn,
    },
  });

  vueApp.use(i18n);
});
