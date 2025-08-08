import { useI18n } from "vue-i18n";

export const useLocale = () => {
  const i18n = useI18n();
  return i18n.locale as Ref<LocalLangCode>;
};

export const useLocaleLangOrder = () => {
  const locale = useLocale();
  const appConfig = useAppConfig();
  const langOrder = toRef(() => [
    ...appConfig.language.order.update[locale.value],
    ...appConfig.language.order.default.filter(
      (lc: LangCode) =>
        !appConfig.language.order.update[locale.value].includes(lc),
    ),
  ]);
  return langOrder as Readonly<Ref<LangCode[]>>;
};

export function useLazyLocale() {
  const bootstrapData = useBootstrapData();
  const localeLangOrder = useLocaleLangOrder();
  const appConfig = useAppConfig();

  /**
   * Lazy Localization function with fallback based on localized language order.
   *
   * @param key - key to localize
   * @returns Localized label or key if not label present
   */
  const getLaLo = (key: string): string => {
    const label = localeLangOrder.value
      .filter(lc => appConfig.language.locale.includes(lc))
      .map(lc => bootstrapData.value?.lalo?.[lc]?.[key])
      .find(value => value !== undefined);
    return label ?? key;
  };

  return {
    getLaLo,
  };
}

export const useOrderedTermbases = () => {
  const appConfig = useAppConfig();
  const bootstrapData = useBootstrapData();
  const { getLaLo } = useLazyLocale();

  const termbases = Object.keys(bootstrapData.value.termbase).filter(
    tb => !appConfig.tb.base.systemTermbases.includes(tb),
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
    ...languages.map(lang => ({
      [lang]: orderedTermbases.value.filter(termbase =>
        bootstrapData.value.termbase[termbase].language.includes(
          lang as LangCode,
        ),
      ),
    })),
  );
}
