import { mono, sans, serif } from 'app/fonts';
import AppShell from 'components/shells/app-shell';
import AppBar from 'components/globals/app-bar';
import { useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Providers } from './providers';
import 'styles/globals.css'

export default async function RootLayout({
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
      <body>
        <Providers>
          <AppShell>
            <AppBar locale={locale} />
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  )
}
