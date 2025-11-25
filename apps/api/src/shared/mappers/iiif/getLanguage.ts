const languageMap = {
  "http://vocab.getty.edu/language/nor": "no",
  "http://vocab.getty.edu/language/nn": "nn",
  "http://vocab.getty.edu/language/nb": "nb",
  "http://vocab.getty.edu/language/en": "en",
  "http://vocab.getty.edu/language/fr": "fr",
  "http://vocab.getty.edu/language/la": "la",
  "http://vocab.getty.edu/language/de": "de",
  "http://vocab.getty.edu/language/sv": "sv",
  "http://vocab.getty.edu/language/ar": "ar",
  "http://vocab.getty.edu/language/it": "it",
  "http://vocab.getty.edu/language/da": "da",
} as const;

export const getLanguage = (input: string): string | { id: string; type: string; _label: string } => {
  if (!input) return {
    id: "http://vocab.getty.edu/language/nor",
    type: "Language",
    _label: "Norwegian"
  };
  // If input is a URL, return the language code
  if (input.startsWith('http')) {
    const mappedLanguage = languageMap[input as keyof typeof languageMap];
    if (!mappedLanguage) {
      console.log('Unknown language URI:', input);
      return 'no';
    }
    return mappedLanguage;
  }

  // Otherwise treat as language code and return language object
  switch (input) {
    case 'no':
      return {
        id: "http://vocab.getty.edu/language/nor",
        type: "Language",
        _label: "Norwegian"
      };
    case 'nor':
      return {
        id: "http://vocab.getty.edu/language/nor",
        type: "Language",
        _label: "Norwegian"
      };
    case 'nn':
      return {
        id: "http://vocab.getty.edu/language/nn",
        type: "Language",
        _label: "Norwegian Nynorsk"
      };
    case 'nb':
      return {
        id: "http://vocab.getty.edu/language/nb",
        type: "Language",
        _label: "Norwegian Bokmål"
      };
    case 'en':
      return {
        id: "http://vocab.getty.edu/language/en",
        type: "Language",
        _label: "English"
      };
    case 'fr':
      return {
        id: "http://vocab.getty.edu/language/fr",
        type: "Language",
        _label: "French"
      };
    case 'la':
      return {
        id: "http://vocab.getty.edu/language/la",
        type: "Language",
        _label: "Latin"
      };
    case 'de':
      return {
        id: "http://vocab.getty.edu/language/de",
        type: "Language",
        _label: "German"
      };
    case 'se':
      return {
        id: "http://vocab.getty.edu/language/sv",
        type: "Language",
        _label: "Swedish"
      };
    case 'sv':
      return {
        id: "http://vocab.getty.edu/language/sv",
        type: "Language",
        _label: "Swedish"
      };
    case 'ar':
      return {
        id: "http://vocab.getty.edu/language/ar",
        type: "Language",
        _label: "Arabic"
      };
    case 'it':
      return {
        id: "http://vocab.getty.edu/language/it",
        type: "Language",
        _label: "Italian"
      };
    case 'da':
      return {
        id: "http://vocab.getty.edu/language/da",
        type: "Language",
        _label: "Danish"
      };
    default:
      return {
        id: "http://vocab.getty.edu/language/nor",
        type: "Language",
        _label: "Norwegian"
      };
  }
}