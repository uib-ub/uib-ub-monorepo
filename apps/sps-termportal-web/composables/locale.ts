import { useI18n } from "vue-i18n";
import { LocalLangCode } from "~/utils/vars-language";

export function useLocale() {
  const i18n = useI18n();
  return i18n.locale.value as LocalLangCode;
}
