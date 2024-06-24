import { Head, Html, Main, NextScript } from "next/document";
import { getLangDir } from 'rtl-detect';

// Set up SSR for styled-components, ensuring there's no missing CSS when deploying a Studio in Next.js into production
export default function Document(props) {
  const direction = getLangDir(props.locale);

  return (
    <Html lang={props.locale}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
        <meta name="color-scheme" content="light dark"></meta>
      </Head>
      <body className='bg-neutral-200 dark:bg-[#35393a]' dir={direction}>
        <Main />
        <NextScript />
      </body >
    </Html >
  );
}
