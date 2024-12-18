import { siteSettings } from '@/src/sanity/lib/queries/fragments'
/* import { Bars4Icon } from '@heroicons/react/24/outline' */
import { sanityFetch } from '@/src/sanity/lib/fetch'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import SanityImage from '@/src/app/components/SanityImage'
import { MainNavContent } from '@/src/app/components/Header/MainNavContent'
import { Footer } from '../../components/Footer'
import { Pane } from '../../components/shells/Pane'
import { PanesShell } from '../../components/shells/PanesShell'
import { TextBlocks } from '../../components/TextBlocks'

async function getData(lang: string) {
  const data = await sanityFetch({ query: siteSettings, params: { language: lang } })
  return data
}

export default async function Home({ params }: { params: { lang: string } }) {
  const { lang } = await params
  const t = await getTranslations('HomePage')
  const data = await getData(lang)
  // Enable static rendering
  setRequestLocale(lang);
  const { identifiedBy, image } = data

  const page = data.frontpage.find((item: any) => item.language === lang) ?? data[0].translation.find((item: any) => item.language === 'no')

  const title = identifiedBy.filter((name: any) => name.language[0] === lang)[0].title
  const subtitle = identifiedBy.filter((name: any) => name.language[0] === lang)[0]?.subtitle
  const linguisticDocumentBody = page?.content

  return (
    <PanesShell className='m-0 flex sm:flex-col'>
      <Pane intent='aside'>
        <div className='flex flex-col justify-center items-center w-prose mt-5'>
          <h2 className='max-sm:text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-3xl text-center font-sans font-bold pb-2 text-neutral-800 dark:text-neutral-100'>
            {t('content')}
          </h2>
          <MainNavContent lang={lang} />
        </div>
      </Pane>

      <Pane intent='content' className='p-0 md:p-0 overflow-y-auto snap-y snap-mandatory max-md:order-first'>
        <div className="p-5 flex flex-col gap-5 w-full md:min-h-screen">
          <div className='w-full max-h-[75vh] relative'>
            <SanityImage
              image={image}
              className='w-full h-full object-cover'
              priority
            />
          </div>
          <div className='flex flex-col'>
            <h1 className="max-sm:text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-6xl text-center font-bold font-sans">{title}</h1>
            {subtitle && <div className="max-sm:text-xs sm:text-sm md:text-xl lg:text-xl xl:text-2xl text-center font-light font-sans">{subtitle}</div>}
          </div>
          <div className='flex flex-col gap-5 container max-w-[1600px] mx-auto pt-10'>
            <TextBlocks value={linguisticDocumentBody} />
          </div>
        </div>

        <Footer locale={lang} className='mx-auto hidden md:flex justify-center items-center h-screen' />
      </Pane>
      <Footer locale={lang} className='mx-auto flex md:hidden justify-center items-center h-screen' />
    </PanesShell>
  )
}
