export function resolveLanguage(localizedObject: Record<string, any>) {
    return localizedObject?.no || localizedObject?.none || '';
}
