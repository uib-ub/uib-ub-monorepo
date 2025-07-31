import { useI18n } from "vue-i18n";
import { termbaseConfig } from "~/utils/vars-termbase";

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

export function useLazyLocale() {
  const bootstrapData = useBootstrapData();
  const locale = useLocale();

  /**
   * Lazy Localization function with fallback based on localized language order.
   *
   * @param key - key to localize
   * @returns Localized label or key if not label present
   */
  const getLaLo = (key: string): string => {
    const label = languageOrder[locale.value]
      .filter((lc) => Object.keys(languageOrder).includes(lc))
      .map((lc) => bootstrapData.value?.lalo?.[lc]?.[key])
      .find((value) => value !== undefined);
    return label ?? key;
  };

  return {
    getLaLo,
  };
}

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
  const { getLaLo } = useLazyLocale();
  const termbases = Object.keys(bootstrapData.value.termbase).filter(
    (tb) => !termbaseConfig.base.systemTermbases.includes(tb)
  );

  const sortedTermbases = termbases.sort((a, b) => {
    const labelA = getLaLo(`${a}-3A${a}`);
    const labelB = getLaLo(`${b}-3A${b}`);

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
  [key in LangCode]: TermbaseId[];
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
