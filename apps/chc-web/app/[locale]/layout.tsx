import { mono, sans, serif } from 'app/fonts';
import AppShell from '@/app/[locale]/_components/app-shell';
import AppBar from '@/app/[locale]/_components/app-bar';
import { useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Providers } from './providers';
import 'styles/globals.css'
import 'ui-react/src/styles/globals.css';

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
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon/favicon.svg" />
      </head>
      <body>
        <Providers>
          <AppShell>
            <AppBar locale={locale} />
            <div className='p-5'>
              {children}
            </div>
          </AppShell>
        </Providers>
      </body>
    </html>
  )
}
