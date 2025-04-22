// Add this helper function before constructCoreMetadata
export const coalesceLabel = (label: any, preferredLangs = ['en', 'no', 'de']): string => {
  if (!label) return;

  if (typeof label === 'string') return label;

  // Handle object with language codes
  for (const lang of preferredLangs) {
    if (label[lang]?.[0]) {
      return label[lang][0];
    }
  }

  // If no preferred language found, take the first available one
  const firstLang = Object.keys(label)[0];
  if (firstLang && label[firstLang]?.[0]) {
    return label[firstLang][0];
  }

  return 'Untitled object';
};
