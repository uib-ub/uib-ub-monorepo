import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
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

