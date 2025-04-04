const languageMap = {
  "http://vocab.getty.edu/aat/300443706": "no",
  "http://vocab.getty.edu/aat/300388277": "en",
  "http://vocab.getty.edu/aat/300388306": "fr"
} as const;

export const getLanguage = (input: string): string | { id: string; type: string; _label: string } => {
  // If input is a URL, return the language code
  if (input.startsWith('http')) {
    return languageMap[input as keyof typeof languageMap] ?? 'no';
  }

  // Otherwise treat as language code and return language object
  switch (input) {
    case 'no':
      return {
        id: "http://vocab.getty.edu/aat/300443706",
        type: "Language",
        _label: "Norwegian"
      };
    case 'en':
      return {
        id: "http://vocab.getty.edu/aat/300388277",
        type: "Language",
        _label: "English"
      };
    case 'fr':
      return {
        id: "http://vocab.getty.edu/aat/300388306",
        type: "Language",
        _label: "French"
      };
    default:
      return {
        id: "http://vocab.getty.edu/aat/300443706",
        type: "Language",
        _label: "Norwegian"
      };
  }
}