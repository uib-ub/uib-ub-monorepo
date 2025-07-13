import { Layout, Navbar, Footer, LocaleSwitch } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { UibIcon, UibUbEn } from 'assets'
import '@/app/globals.css'
import { FC, ReactNode } from 'react'

export const metadata = {
  title: 'Dev @ UiB-UB',
  description: 'Resources for developers using data and services from The university of Bergen Library.'
}

const navbar = (
  <Navbar
    logo={
      <div style={{ display: 'flex', gap: '.5em' }}>
        <UibIcon className='fill-current' style={{ width: '1.5em', height: '1.5em' }} />
        <span>Dev @ UiB-UB</span>
      </div>
    }
  >
    <LocaleSwitch lite />
  </Navbar>
)

const footer = (
  <Footer>
    <div style={{ display: 'flex', gap: '.5em', alignItems: 'center' }}>
      <UibUbEn className='fill-current' style={{ width: '25em', height: 'auto' }} />
    </div>
  </Footer>
)

type LayoutProps = Readonly<{
  children: ReactNode
  params: Promise<{
    lang: string
  }>
}>

const RootLayout: FC<LayoutProps> = async ({ children, params }) => {
  const { lang } = await params
  let pageMap = await getPageMap(`/${lang}`)


  return (
    <html lang={lang} dir="ltr" suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="Dev @ UiB-UB" />
        <meta property="og:description" content="Resources for developers using data and services from The university of Bergen Library." />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/uib-ub/uib-ub-monorepo/tree/main/apps/docs"
          footer={footer}
          i18n={[
            { locale: 'nb', name: 'Norsk (Bokmål)' },
            { locale: 'en', name: 'English' },
          ]}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}

export default RootLayout