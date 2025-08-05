import type NorwegianLocale from './nb'

export const i18n = {
  defaultLocale: 'nb',
  locales: ['nb', 'en']
} as const

export type Locale = (typeof i18n)['locales'][number]

export type Dictionary = typeof NorwegianLocale

export type Dictionaries = Record<
  Locale,
  () => Promise<{ default: Dictionary }>
>