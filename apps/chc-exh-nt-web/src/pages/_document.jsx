import { Head, Html, Main, NextScript } from "next/document";
import { ServerStyleSheetDocument } from 'next-sanity/studio'
import { useRouter } from 'next/dist/client/router';

// Set up SSR for styled-components, ensuring there's no missing CSS when deploying a Studio in Next.js into production
export default class Document extends ServerStyleSheetDocument {
  render() {
    return (
      // TODO: Functionality for setting writing direction based on language
      <Html lang="en" dir="ltr" >
        <Head />
        <body className='bg-neutral-200 dark:bg-[#35393a]'>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
