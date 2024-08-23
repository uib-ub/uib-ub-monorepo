import { useI18n } from "vue-i18n";
import { Samling } from "~/utils/vars-termbase";

export type LocalLangCode = "en" | "nb" | "nn";

export type LangCode =
  | "ar"
  | "da"
  | "de"
  | "en"
  | "en-GB"
  | "en-US"
  | "fa-af"
  | "fi"
  | "fr"
  | "it"
  | "la"
  | "nb"
  | "nn"
  | "pl"
  | "ru"
  | "so"
  | "es"
  | "sv"
  | "ti";

export const useLocale = () => {
  const i18n = useI18n();
  return i18n.locale as Ref<LocalLangCode>;
};

export const useLocales = () => {
  return Object.keys(languageOrder) as LocalLangCode[];
};

export const useLocaleLangOrder = () => {
  const locale = useLocale();
  const langOrder = toRef(() => languageOrder[locale.value]);
  return langOrder as Readonly<Ref<LangCode[]>>;
};

export const dataDisplayOnlyLanguages = ["en-GB", "en-US"];

export const languageOrder: { [key in LocalLangCode]: LangCode[] } = {
  nb: [
    "nb",
    "nn",
    "en",
    "en-GB",
    "en-US",
    "ar",
    "da",
    "fi",
    "fr",
    "it",
    "la",
    "pl",
    "ru",
    "so",
    "es",
    "sv",
    "ti",
    "de",
  ],
  nn: [
    "nn",
    "nb",
    "en",
    "en-GB",
    "en-US",
    "ar",
    "da",
    "fi",
    "fr",
    "it",
    "la",
    "pl",
    "ru",
    "so",
    "es",
    "sv",
    "ti",
    "de",
  ],
  en: [
    "en",
    "en-GB",
    "en-US",
    "nb",
    "nn",
    "ar",
    "da",
    "fi",
    "fr",
    "de",
    "it",
    "la",
    "pl",
    "ru",
    "so",
    "es",
    "sv",
    "ti",
  ],
};

// TODO refactor with lazy data
function deriveLanguageInfo(languages: LangCode[]): {
  [key in LangCode]: Samling[];
} {
  return Object.assign(
    {},
    ...languages.map((lang) => ({
      [lang]: termbaseOrder.filter((base) =>
        termbaseInfo[base].includes(lang as LangCode)
      ),
    }))
  );
}

export const languageInfo = deriveLanguageInfo(languageOrder.nb);
export const languageRtoL: Set<LangCode> = new Set(["ar"]);
