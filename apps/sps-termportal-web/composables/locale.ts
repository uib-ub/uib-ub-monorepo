import { useI18n } from "vue-i18n";
import { Samling } from "~/utils/vars-termbase";

export type LocalLangCode = "en" | "nb" | "nn";

export type LangCode =
  | "ar"
  | "da"
  | "de"
  | "en"
  | "en-gb"
  | "en-us"
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

export const dataDisplayOnlyLanguages = ["en-gb", "en-us"];

export const languageOrder: { [key in LocalLangCode]: LangCode[] } = {
  nb: [
    "nb",
    "nn",
    "en",
    "en-gb",
    "en-us",
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
    "en-gb",
    "en-us",
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
    "en-gb",
    "en-us",
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

export function localizeSnomedVersionLabel() {
  const termbaseData = useTermbaseData();
  const locale = useLocale();
  const date = new Date(termbaseData.value.SNOMEDCT.versionEdition);
  const options = {
    year: "numeric",
    month: "long",
    hour12: true,
  };
  return date.toLocaleString(locale.value, options);
}

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
