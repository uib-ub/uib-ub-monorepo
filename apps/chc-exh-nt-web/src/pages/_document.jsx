import { ServerStyleSheetDocument } from 'next-sanity/studio';
import { Head, Html, Main, NextScript } from "next/document";

// Set up SSR for styled-components, ensuring there's no missing CSS when deploying a Studio in Next.js into production
export default class Document extends ServerStyleSheetDocument {
  render() {
    return (
      <Html lang={this.props.locale} dir='auto' >
        <Head />
        <body className='bg-neutral-200 dark:bg-[#35393a]'>
          <Main />
          <NextScript />
        </body >
      </Html >
    )
  }
}
