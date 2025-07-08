import { Layout, Navbar, Footer } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { UibIcon, UibUbEn } from 'assets'
import './globals.css'

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
  />
)

const footer = (
  <Footer>
    <div style={{ display: 'flex', gap: '.5em', alignItems: 'center' }}>
      <UibUbEn className='fill-current' style={{ width: '25em', height: 'auto' }} />
    </div>
  </Footer>
)

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="Dev @ UiB-UB" />
        <meta property="og:description" content="Resources for developers using data and services from The university of Bergen Library." />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/uib-ub/uib-ub-monorepo"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
} 