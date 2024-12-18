import { ThemeProvider } from '@/src/app/components/providers/theme-provider'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link, routing } from '@/src/i18n/routing';
import { Merriweather_Sans, Newsreader } from 'next/font/google'
import Script from 'next/script'
import * as React from 'react'
import '@/src/globals.css'
import { MainNav } from '@/src/app/components/Header/MainNav';
import LocaleSwitcher from '@/src/app/components/LocaleSwitcher'
import { ThemeSwitch } from '@/src/app/components/ThemeSwitch'
import { siteSettings } from '@/src/sanity/lib/queries/fragments';
import { sanityFetch } from '@/src/sanity/lib/fetch';
import { MainNavContent } from '@/src/app/components/Header/MainNavContent';
import { Footer } from '@/src/app/components/Footer';
import { AppShell } from '@/src/app/components/shells/AppShell';
import { PanesShell } from '@/src/app/components/shells/PanesShell';
import { Pane } from '@/src/app/components/shells/Pane';
import { HeaderShell } from '@/src/app/components/shells/HeaderShell';
import { UibIcon, UiBUBMarcusLogo } from 'assets';
import { Popover, PopoverTrigger, PopoverContent } from '@/src/app/components/ui/popover';
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
  params: { lang: string }
}) {
  const { lang } = await params;
  const data = await getData(lang);
  const { identifiedBy, image } = data;

  const title = identifiedBy.filter((name: any) => name.language[0] === lang)[0].title;
  const subtitle = identifiedBy.filter((name: any) => name.language[0] === lang)[0]?.subtitle;

  return {
    title: {
      default: stegaClean(title[0] ?? title),
      template: `%s | ${stegaClean(title[0] ?? title)}`
    },
    description: stegaClean(subtitle[0] ?? subtitle),
    openGraph: {
      title: stegaClean(title[0] ?? title),
      description: stegaClean(subtitle[0] ?? subtitle),
      locale: lang,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: stegaClean(title[0] ?? title),
      description: stegaClean(subtitle[0] ?? subtitle),
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
  // Enable static rendering
  setRequestLocale(lang);

  const data = await getData(lang);
  const { identifiedBy } = data;

  const title = identifiedBy.filter((name: any) => name.language[0] === lang)[0].title;

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

                <Pane intent='content' className='p-0 md:p-0'>
                  {children}
                  <Footer locale={lang} className='mx-auto flex justify-center items-center h-screen' />
                </Pane>
              </PanesShell>
            </AppShell>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}