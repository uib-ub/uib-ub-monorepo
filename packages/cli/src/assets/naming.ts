/**
 * Convert a kebab-case asset name to PascalCase for react export names.
 * E.g. "uib-ub-no" -> "UibUbNo"
 */
export function pascalCase(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function isKebabCase(name: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name);
}
