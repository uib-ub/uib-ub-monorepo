import 'server-only';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));

export const i18n = {
  defaultLocale: 'no',
  locales: ['no', 'en'],
}

export type Locale = typeof i18n['locales'][number]