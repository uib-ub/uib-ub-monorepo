export const getLanguage = (lang: string) => {
  switch (lang) {
    case 'no':
      return {
        id: "https://vocab.getty.edu/aat/300443706",
        type: "Language",
        _label: "Norwegian"
      };
    case 'en':
      return {
        id: "https://vocab.getty.edu/aat/300388277",
        type: "Language",
        _label: "English"
      };
    case 'fr':
      return {
        id: "https://vocab.getty.edu/aat/300388306",
        type: "Language",
        _label: "French"
      };
    default:
      return {
        id: "https://vocab.getty.edu/aat/300443706",
        type: "Language",
        _label: "Norwegian"
      };
  }
};
