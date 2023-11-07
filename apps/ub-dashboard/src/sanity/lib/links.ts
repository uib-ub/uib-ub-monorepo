export function resolveHref(
  documentType?: string,
  slug?: string,
): string | undefined {
  switch (documentType) {
    case 'Actor':
      return slug ? `/persons/${slug}` : undefined
    case 'Group':
      return slug ? `/groups/${slug}` : undefined
    default:
      console.warn('Invalid document type:', documentType)
      return undefined
  }
}