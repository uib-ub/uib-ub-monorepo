export function resolveLanguage(localizedObject: Record<string, any>) {
  return localizedObject?.no || localizedObject?.none || '';
}

// Resolve language if no source
export function resolveLanguageField(fields: Record<string, any>) {
  if (fields?.["label.no"]) {
    return fields?.["label.no"]
  } else if (fields?.["label.none"]) {
    return fields?.["label.none"]
  } else {
    return fields?.["label.en"]
  }
}


export function ensureArrayValues(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  // Fields that should have array values
  const arrayFields = ['label', 'value', 'summary'];

  // Process array fields at this level
  arrayFields.forEach(field => {
    if (obj[field]) {
      Object.keys(obj[field]).forEach(lang => {
        if (typeof obj[field][lang] === 'string') {
          obj[field][lang] = [obj[field][lang]];
        }
      });
    }
  });

  // Recursively process other objects
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && !arrayFields.includes(key)) {
      obj[key] = ensureArrayValues(obj[key]);
    }
  });

  return obj;
}
