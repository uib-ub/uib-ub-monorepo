import { useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import 'tailwindcss/tailwind.css'

import { IBM_Plex_Mono, Inter, PT_Serif } from 'next/font/google'

const serif = PT_Serif({
  variable: '--font-serif',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  weight: ['400', '700'],
})
const sans = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  // @todo: understand why extrabold (800) isn't being respected when explicitly specified in this weight array
  // weight: ['500', '700', '800'],
})
const mono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['500', '700'],
})

export default async function LocaleLayout({
  children, params
}: {
  children: React.ReactNode, params: any
}) {
  const locale = useLocale();

  // Show a 404 error if the user requests an unknown locale
  if (params.locale !== locale) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${mono.variable} ${sans.variable} ${serif.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon/favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
