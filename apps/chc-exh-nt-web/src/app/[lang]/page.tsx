import { siteSettings } from '@/src/sanity/lib/queries/fragments'
/* import { Bars4Icon } from '@heroicons/react/24/outline' */
import { sanityFetch } from '@/src/sanity/lib/fetch'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import SanityImage from '@/src/app/_components/SanityImage'
import { MainNavContent } from '@/src/app/_components/Header/MainNavContent'
import { Footer } from '../_components/Footer'
import { Pane } from '../_components/shells/Pane'
import { PanesShell } from '../_components/shells/PanesShell'
import { TextBlocks } from '../_components/TextBlocks'

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
      <Pane intent='aside' padded={false}>
        <div className='flex flex-col gap-3 md:mt-5'>
          <div className='w-full relative md:hidden block'>
            <SanityImage
              image={image}
              className='w-full h-full object-cover'
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans">{title}</h1>
          {subtitle && <div className="font-light font-sans">{subtitle}</div>}

          <h2 className='max-sm:text-xl sm:text-2xl font-sans font-bold pb-2 text-neutral-800 dark:text-neutral-100'>
            {t('content')}
          </h2>
          <MainNavContent lang={lang} />
        </div>
      </Pane>

      <Pane intent='content' className='p-0 md:p-0 m-0 overflow-y-auto snap-y snap-mandatory hidden md:flex max-w-[1200px]'>
        <div className='w-full relative justify-start'>
          <SanityImage
            image={image}
            className='object-cover'
            priority
          />
        </div>
        {/* <div className='flex flex-col'>
            <h1 className="max-sm:text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-6xl text-center font-bold font-sans">{title}</h1>
            {subtitle && <div className="max-sm:text-xs sm:text-sm md:text-xl lg:text-xl xl:text-2xl text-center font-light font-sans">{subtitle}</div>}
          </div> */}
        <div className='flex flex-col container max-w-[1600px] mx-auto'>
          <TextBlocks value={linguisticDocumentBody} />
        </div>

        <Footer locale={lang} className='mx-auto hidden md:flex justify-center items-center h-screen' />
      </Pane>
      <Footer locale={lang} className='mx-auto flex md:hidden justify-center items-center h-screen' />
    </PanesShell>
  )
}
