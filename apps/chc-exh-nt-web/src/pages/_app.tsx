import "tailwind-ui/styles.css";
import "../styles/globals.css";

import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from "next/app";
import { Merriweather_Sans, Newsreader, Noto_Naskh_Arabic, Rubik } from 'next/font/google';
import { useRouter } from 'next/router';
import Script from 'next/script';
import * as React from "react";
import { getLangDir } from 'rtl-detect';

const merriweatherSans = Merriweather_Sans({
  subsets: ['latin'],
  variable: '--font-merriweatherSans',
  fallback: ['Helvetica', 'ui-sans-serif', 'sans-serif'],
  adjustFontFallback: false,
})

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  fallback: ['Times New Roman', 'ui-serif', 'serif'],
  adjustFontFallback: false,
})

const arabic = Rubik({
  subsets: ['arabic'],
  variable: '--font-arabic',
  fallback: ['ui-serif', 'serif'],
  adjustFontFallback: false,
})

const arabicSerif = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabicSerif',
  fallback: ['ui-serif', 'serif'],
  adjustFontFallback: false,
})

const App = ({ Component, pageProps }: AppProps) => {
  const { locale } = useRouter();
  const direction = getLangDir(locale!);

  React.useEffect(() => {
    document.querySelector("body")!.setAttribute("dir", direction);
  }, [direction]);

  return (
    <React.StrictMode>
      <style jsx global>
        {`
          :root {
            --font-merriweatherSans: ${merriweatherSans.style.fontFamily};
            --font-newsreader: ${newsreader.style.fontFamily};
            --font-arabic: ${arabic.style.fontFamily};
            --font-arabicSerif: ${arabicSerif.style.fontFamily};
            }
        `}
      </style>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />
      {/* NEXT_PUBLIC_GOOGLE_ANALYTICS */}
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

      <NextIntlClientProvider
        locale={locale}
        timeZone="Europe/Oslo"
        messages={pageProps.messages}
      >
        <ThemeProvider enableSystem={true} attribute="class">
          <>
            {/* @ts-ignore */}
            <Component {...pageProps} />
          </>
        </ThemeProvider>
      </NextIntlClientProvider>
    </React.StrictMode>
  );
};

export default App;
