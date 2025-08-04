import { createI18n } from "vue-i18n";
import en from "../locales/en.json";
import nb from "../locales/nb.json";
import nn from "../locales/nn.json";

export default defineNuxtPlugin(({ vueApp }) => {
  const appConfig = useAppConfig();
  const cookie = useCookie("locale", appConfig.cookie.localeOptions);
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

  return {
    provide: {
      i18n: i18n.global,
    },
  };
});
