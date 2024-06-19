import { Bars4Icon } from '@heroicons/react/24/outline';
import type { GetStaticProps, NextPage } from 'next';
import { useTranslations } from 'next-intl';
import { groq } from 'next-sanity';
import Head from "next/head";
import { NextRouter, useRouter } from 'next/router';
import React from "react";
import { LocaleSwitch, NavLink, Spacer, ThemeSwitch } from "tailwind-ui";
import { Footer } from '../components/Footer';
import { MainNav } from '../components/Header/MainNav';
import SanityImage from '../components/SanityImage';
import Sections from '../components/TextBlocks/Blocks/Sections';
import { mainNav, siteSettings } from '../lib/queries/fragments';
import { getClient } from '../lib/sanity.server';

const frontpageQuery = groq`
  {
    ${siteSettings},
    ${mainNav}
  }
`

export const getStaticProps: GetStaticProps = async ({ locale, preview = false }) => {
  const data = await getClient(preview).fetch(frontpageQuery, { language: locale })
  //console.log(JSON.stringify(data, null, 2))
  return {
    props: {
      data,
      locale,
      preview,
      messages: (await import(`../messages/${locale}.json`)).default
    },
  }
}

const Home: NextPage = ({ data, preview }: any) => {
  const { locale }: NextRouter = useRouter()
  const t = useTranslations('Nav');

  const { mainNav, siteSettings: { label, description, identifiedBy, image, frontpage, fallback } } = data
  /* console.log("🚀 ~ file: index.tsx:39 ~ data", JSON.stringify(fallback, null, 2)) */

  const title = identifiedBy.filter((name: any) => name.language[0] === locale)[0].title
  const subtitle = identifiedBy.filter((name: any) => name.language[0] === locale)[0].subtitle ?? undefined
  const linguisticDocumentBody = frontpage[0]?.content ?? fallback[0]?.content


  const heroImage = image ? <SanityImage
    image={image}
    type='fill'
    alt={image?.alt?.[locale || 'no'] ?? ''}
    priority
  /> : null

  return (
    <>
      <Head>
        <title>{label[locale || 'no']}</title>
        <meta name="description" content={description[locale || 'no']} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='bg-white dark:bg-neutral-900'>
        <header className='px-3 py-3 sticky top-0 w-full z-10'>
          <div className='flex gap-2 items-start'>
            <MainNav
              title={t('menu')}
              aria-label='primary navigation'
              buttonLabel={
                <div className='p-2 md:p-3 gap-3 flex bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded items-center'>
                  <Bars4Icon className={'max-sm:w-5 max-sm:h-5 sm:w-6 sm:h-6'} />
                  <div className='max-md:sr-only'>{t('menu')}</div>
                </div>
              }
              value={mainNav}
            />
            <Spacer />
            <div className='p-1 md:p-3 gap-3 flex-col bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded'>
              <div className='flex gap-2 items-end'>
                <LocaleSwitch
                  lite
                  labels={{
                    no: 'Norsk',
                    en: 'English',
                    ar: 'Arabic',
                  }}
                />
                <ThemeSwitch lite />
              </div>
            </div>
          </div>
        </header>

        <main className='flex flex-col'>
          <div className="p-5 flex flex-col items-center justify-center gap-5 w-full">
            <div className='h-[300px] sm:h-[400px] md:h-[700px] w-full relative'>
              {heroImage}
            </div>
            <div className='flex flex-col'>
              <h1 className="max-sm:text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-6xl text-center font-bold font-sans rtl:font-arabic">{title}</h1>
              <div className="max-sm:text-xs sm:text-sm md:text-xl lg:text-xl xl:text-2xl text-center font-light font-sans rtl:font-arabic">{subtitle}</div>
            </div>
          </div>
        </main>

        <div className='flex flex-col justify-center items-center w-prose mt-5'>

          <h2 className='max-sm:text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-3xl text-center font-sans rtl:font-arabic font-bold pb-2 text-neutral-800 dark:text-neutral-100'>
            {t('toc')}
          </h2>

          <ul className='text-lg dark:text-neutral-300 text-neutral-700 p-5'>
            {mainNav?.sections && mainNav?.sections.map((section: any, index: number) => (
              <React.Fragment key={section._key}>
                {section?.label ?
                  <li key={section._key} className='border-b text-md font-light first:mt-0 mt-4'>
                    {section?.label?.[locale || ''] || section?.target?.label?.[locale || '']}
                  </li>
                  : null
                }
                {section?.target ?
                  <li key={section._key} className='text-md font-light first:mt-0 mt-4'>
                    <NavLink href={`/${section?.target?.route}`}>
                      {section?.target?.label?.[locale!] ?? section?.target?.label?.['en']}
                    </NavLink>
                  </li>
                  : null
                }
                <ul>
                  {section?.links && section?.links.map((link: any) => (
                    <li key={link._key} className='mt-1 pl-4'>
                      <NavLink href={`/${link?.target?.route}`}>
                        {(link?.label?.[locale!] ?? link?.label?.['en']) || (link?.target?.label?.[locale!] || link?.target?.label?.['en'])}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </React.Fragment>
            ))}
          </ul>
        </div>


        <div className='mb-28 grid grid-cols-content font-light font-serif rtl:font-arabicSerif text-lg max-w-[1200px] mx-auto'>
          {linguisticDocumentBody && <Sections sections={linguisticDocumentBody} />}
        </div>

        <Footer locale={locale} />

      </div>
    </>
  );
};

export default Home
