import 'server-only'
import type { Dictionaries, Dictionary } from './i18n-config'

// We enumerate all dictionaries here for better linting and TypeScript support
// We also get the default import for cleaner types
const dictionaries: Dictionaries = {
  nb: () => import('./nb'),
  en: () => import('./en'),
}

export async function getDictionary(locale: string): Promise<Dictionary> {
  const { default: dictionary } = await
  (dictionaries[locale] || dictionaries.nb)()

  return dictionary
}

export function getDirection(locale: string): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}