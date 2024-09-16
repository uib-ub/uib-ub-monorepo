import { useI18n } from "vue-i18n";
import { systemTermbases } from "~/utils/vars-termbase";

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

export const useOrderedTermbases = () => {
  const bootstrapData = useBootstrapData();
  const termbases = Object.keys(bootstrapData.value.termbase).filter(
    (tb) => !systemTermbases.includes(tb)
  );

  const sortedTermbases = termbases.sort((a, b) => {
    const labelA = lalof(`${a}-3A${a}`);
    const labelB = lalof(`${b}-3A${b}`);

    return labelA.localeCompare(labelB);
  });

  return toRef(() => sortedTermbases);
};

export function localizeSnomedVersionLabel() {
  const bootstrapData = useBootstrapData();
  const locale = useLocale();
  const date = new Date(bootstrapData.value.termbase.SNOMEDCT.versionEdition);
  const options = {
    year: "numeric",
    month: "long",
    hour12: true,
  };
  return date.toLocaleString(locale.value, options);
}

// TODO refactor with lazy data
export function deriveLanguageInfo(languages: LangCode[]): {
  [key in LangCode]: Samling[];
} {
  const bootstrapData = useBootstrapData();
  const orderedTermbases = useOrderedTermbases();
  return Object.assign(
    {},
    ...languages.map((lang) => ({
      [lang]: orderedTermbases.value.filter((termbase) =>
        bootstrapData.value.termbase[termbase].language.includes(
          lang as LangCode
        )
      ),
    }))
  );
}

export const languageRtoL: Set<LangCode> = new Set(["ar"]);
