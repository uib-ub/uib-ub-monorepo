import "../styles/globals.css";
import "tailwind-ui/styles.css";

import type { AppProps } from "next/app";
import * as React from "react";
import { ThemeProvider } from 'next-themes';
import { Merriweather_Sans, Newsreader } from 'next/font/google'
import Script from 'next/script';

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

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <React.StrictMode>
      <style jsx global>
        {`
          :root {
            --font-merriweathersans: ${merriweathersans.style.fontFamily};
            --font-newsreader: ${newsreader.style.fontFamily};
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
      <ThemeProvider enableSystem={true} attribute="class">
        <>
          {/* @ts-ignore */}
          <Component {...pageProps} />
        </>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;
