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
