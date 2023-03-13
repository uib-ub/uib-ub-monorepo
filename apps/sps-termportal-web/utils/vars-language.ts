import { Samling } from "./vars-termbase";

export type LocalLangCode = "en" | "nb" | "nn";

export type LangCode =
  | "ar"
  | "da"
  | "de"
  | "en"
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

export const languageOrder: { [key in LocalLangCode]: LangCode[] } = {
  nb: [
    "nb",
    "nn",
    "en",
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
