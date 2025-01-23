import { ThemeProvider } from '@/src/components/providers/theme-provider'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link, routing } from '@/src/i18n/routing';
import { Merriweather_Sans, Newsreader } from 'next/font/google'
import Script from 'next/script'
import * as React from 'react'
import '@/src/globals.css'
import { MainNav } from '@/src/components/Header/MainNav';
import LocaleSwitcher from '@/src/components/LocaleSwitcher'
import { siteSettings } from '@/src/sanity/lib/queries/fragments';
import { sanityFetch } from '@/src/sanity/lib/fetch';
import { MainNavContent } from '@/src/components/Header/MainNavContent';
import { Footer } from '@/src/components/Footer';
import { ThemeSwitch } from '@/src/components/ThemeSwitch';
import { UiBUBMarcusLogo, UibIcon } from 'assets/src/react';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { AppShell } from '@/src/components/shells/AppShell';
import { PopoverContent } from '@/src/components/ui/popover';
import { PanesShell } from '@/src/components/shells/PanesShell';
import { Pane } from '@/src/components/shells/Pane';
import { HeaderShell } from '@/src/components/shells/HeaderShell';
import { ExternalLinkIcon } from 'lucide-react';
import { urlFor } from '@/src/sanity/lib/utils';
import { stegaClean } from 'next-sanity';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const merriweathersans = Merriweather_Sans({
  subsets: ['latin'],
  variable: '--font-merriweathersans',
  fallback: ['Helvetica', 'ui-sans-serif', 'sans-serif'],
  adjustFontFallback: false,
})

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  fallback: ['Times New Roman', 'ui-serif', 'serif'],
  adjustFontFallback: false,
})

async function getData(lang: string) {
  const data = await sanityFetch({ query: siteSettings, params: { language: lang } })
  return data
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params;
  const data = await getData(lang);
  const { identifiedBy, image } = data;

  const title = identifiedBy.filter((name: any) => name.language[0] === lang)?.[0]?.title;
  const subtitle = identifiedBy.filter((name: any) => name.language[0] === lang)?.[0]?.subtitle;

  return {
    title: {
      default: stegaClean(title?.[0] ?? title),
      template: `%s | ${stegaClean(title?.[0] ?? title)}`
    },
    description: stegaClean(subtitle?.[0] ?? subtitle),
    openGraph: {
      title: stegaClean(title?.[0] ?? title),
      description: stegaClean(subtitle?.[0] ?? subtitle),
      locale: lang,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: stegaClean(title?.[0] ?? title),
      description: stegaClean(subtitle?.[0] ?? subtitle),
      images: [urlFor(image)?.url()]
    }
  }
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  const { lang } = await params
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(lang as any)) {
    notFound();
  }

  const data = await getData(lang);
  const { identifiedBy } = data;

  const title = identifiedBy.filter((name: any) => name.language[0] === lang)[0].title;

  // Enable static rendering
  setRequestLocale(lang);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const t = await getTranslations('HomePage');

  return (
    <html
      lang={lang}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`${merriweathersans.variable} ${newsreader.variable} bg-white dark:bg-neutral-900`}
      suppressHydrationWarning
    >
      <head>
        <Script
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
        />
        <Script id="analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className='min-h-screen'>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <AppShell>
              <PanesShell>
                <Pane intent='sidebar' padded={false}>
                  <UibIcon className='w-10 h-10' />
                  <MainNav layout='sidebar'>
                    <MainNavContent lang={lang} />
                  </MainNav>

                  <div className='grow' aria-hidden>&nbsp;</div>
                  <HeaderShell>
                    <Link href={`/`}>{title}</Link>
                  </HeaderShell>

                  <div className='flex md:flex-col gap-2'>
                    <LocaleSwitcher layout='sidebar' />
                    <ThemeSwitch layout='sidebar' />
                  </div>
                  <Popover>
                    <PopoverTrigger>
                      <UiBUBMarcusLogo className='w-8 h-8' />
                    </PopoverTrigger>
                    <PopoverContent side='right' sideOffset={30} className='w-fit'>
                      <p>{t('marcus')} <a href="https://marcus.uib.no/" target="_blank" className="underline">
                        Marcus <ExternalLinkIcon className="w-4 h-4 inline-block" />
                      </a></p>
                    </PopoverContent>
                  </Popover>
                </Pane>

                <Pane intent='content' className='p-0 md:p-0 flex sm:flex-col'>
                  {children}
                </Pane>
              </PanesShell>
            </AppShell>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

{/* <div className='flex flex-col min-h-screen'>
              <header className='px-3 py-3 sticky top-0 w-full z-10'>
                <div className='flex gap-2 justify-between'>
                  <MainNav>
                    <MainNavContent lang={lang} />
                  </MainNav>
                  <div className='p-0 md:px-2 md:py-2 gap-3 flex-col bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded'>
                    <div className='flex gap-2 align-middle'>
                      <LocaleSwitcher layout='header' />
                      <ThemeSwitch layout='header' />
                    </div>
                  </div>
                </div>
              </header>
              <main className='flex-grow'>
                {children}
              </main>
              <Footer locale={lang} className='mx-auto mt-16 pb-32 self-end' />
            </div> */}