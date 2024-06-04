import "tailwind-ui/styles.css";
import "../styles/globals.css";

import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from "next/app";
import { Merriweather_Sans, Newsreader } from 'next/font/google';
import { useRouter } from 'next/router';
import Script from 'next/script';
import * as React from "react";


const sans = Merriweather_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  fallback: ['Helvetica', 'ui-sans-serif', 'sans-serif'],
  adjustFontFallback: false,
})

const serif = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  fallback: ['Times New Roman', 'ui-serif', 'serif'],
  adjustFontFallback: false,
})

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  return (
    <React.StrictMode>
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
        locale={router.locale}
        timeZone="Europe/Oslo"
        messages={pageProps.messages}
      >
        <ThemeProvider enableSystem={true} attribute="class">
          <>
            {/* @ts-ignore */}
            <Component {...pageProps} className={`${sans.variable} ${serif.variable}`} />
          </>
        </ThemeProvider>
      </NextIntlClientProvider>
    </React.StrictMode>
  );
};

export default App;
