export const dynamic = 'force-static';
import { FC, ReactNode } from 'react'
import { Layout, Navbar, Footer, LocaleSwitch, LastUpdated } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { UibIcon, UibUbEn } from 'assets'
import { getDictionary, getDirection } from '../_dictionaries/get-dictionary'
import '@/app/globals.css'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  return {
    title: dictionary.logo.title,
    description: 'Resources for developers using data and services from The university of Bergen Library.'
  }
}

type LayoutProps = Readonly<{
  children: ReactNode
  params: Promise<{
    lang: string
  }>
}>

const RootLayout: FC<LayoutProps> = async ({ children, params }: LayoutProps) => {
  const { lang } = await params
  const dictionary = await getDictionary(lang)
  const pageMap = await getPageMap(`/${lang}`)

  const navbar = (
    <Navbar
      logo={
        <div style={{ display: 'flex', gap: '.5em' }}>
          <UibIcon className='fill-current' style={{ width: '1.5em', height: '1.5em' }} />
          <span>{dictionary.logo.title}</span>
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
  return (
    <html lang={lang} dir={getDirection(lang)} suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content={dictionary.logo.title} />
        <meta property="og:description" content="Resources for developers using data and services from The university of Bergen Library." />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/uib-ub/uib-ub-monorepo/tree/main/apps/docs"
          footer={footer}
          i18n={[
            { locale: 'nb', name: dictionary.i18n.nb },
            { locale: 'en', name: dictionary.i18n.en },
          ]}
          toc={{
            backToTop: dictionary.backToTop,
          }}
          editLink={dictionary.editPage}
          lastUpdated={<LastUpdated locale={lang}>{dictionary.lastUpdated}</LastUpdated>}
          /* nextThemes={{ defaultTheme: 'dark' }} */
          themeSwitch={{
            dark: dictionary.dark,
            light: dictionary.light,
            system: dictionary.system
          }}
          feedback={{
            content: dictionary.feedback,
            link: 'https://github.com/uib-ub/uib-ub-monorepo/issues'
          }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}

export default RootLayout