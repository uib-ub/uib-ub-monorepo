import React from "react";
import type { GetStaticProps, NextPage } from 'next'
import { getClient } from '../../lib/sanity.server'
import { mainNav, siteSettings, items } from '../../lib/queries/fragments'
import Head from "next/head";
import { Layout, LocaleSwitch, Pane, MarcusIcon, UiBIcon, Menu, Modal } from "tailwind-ui";
import { NextRouter, useRouter } from 'next/router';
import NextLink from 'next/link';
import { groq } from 'next-sanity'
import SanityImage from '../../components/SanityImage';
import { MainNav } from '../../components/Header/MainNav';
import { ArrowTopRightOnSquareIcon, Bars4Icon } from '@heroicons/react/24/outline';
import { Footer } from '../../components/Footer';

const itemsQuery = groq`
  {
    ${siteSettings},
    ${mainNav},
    ${items}
  }
`

export const getStaticProps: GetStaticProps = async ({ locale, preview = false }) => {
  const data = await getClient(preview).fetch(itemsQuery, { language: locale })
  //console.log(JSON.stringify(data, null, 2))
  return {
    props: {
      data,
      locale,
      preview,
      //messages: (await import(`../messages/${locale}.json`)).default
    },
  }
}

const Browse: NextPage = ({ data, preview }: any) => {
  const { locale, locales, asPath, defaultLocale }: NextRouter = useRouter()
  const { mainNav, siteSettings: { label, description, identifiedBy }, items } = data
  const title = identifiedBy.filter((name: any) => name.language[0] === locale)[0].title[0]

  return (
    <>
      <Head>
        <title>{label[locale || 'no']}</title>
        <meta name="description" content={description[locale || 'no']} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout
        data={data}
        title={
          <NextLink href={`/`} className='text-neutral-800 dark:text-neutral-200 font-bold'>
            {title}
          </NextLink>
        }
        nav={
          <div className='flex sm:flex-col gap-2'>
            <UiBIcon className='max-sm:w-6 max-sm:h-6 md:w-8 md:h-8 text-neutral-800 dark:text-neutral-100 dark:hover:text-neutral-200' />
            <MainNav
              title={locale === 'no' ? 'Meny' : 'Menu'}
              aria-label='primary navigation'
              buttonLabel={
                <div className='gap-1 flex md:flex-col backdrop-blur-sm rounded items-center'>
                  <Bars4Icon className={'max-sm:w-5 max-sm:h-5 sm:w-6 sm:h-6'} />
                  <div className='max-md:sr-only'>Menu</div>
                </div>
              }
              value={mainNav}
            />
          </div>
        }
        icon={
          <Menu
            aria-label='secondary navigation'
            button={
              <MarcusIcon className='max-sm:w-6 max-sm:h-6 md:w-8 md:h-8 text-neutral-700 hover:text-neutral-800 dark:text-neutral-200 dark:hover:text-neutral-200' />
            }>
            <div className='gap-5 text-sm dark:text-neutral-300 text-neutral-700 px-5 py-3'>
              {locale === 'no' && <div>Denne utstillingen er en del av <a href='https://marcus.uib.no' target='_blank' rel="noreferrer">Marcus <ArrowTopRightOnSquareIcon className='inline h-4 w-4' /></a></div>}
              {locale === 'en' && <div>This exhibition is a part of <a href='https://marcus.uib.no' target='_blank' rel="noreferrer">Marcus <ArrowTopRightOnSquareIcon className='inline h-4 w-4' /></a></div>}
            </div>
          </Menu>
        }
      >

        <Pane intent='content'>
          <main className='md:flex md:flex-grow min-h-screen'>
            <div className='flex flex-wrap justify-center items-center gap-5 w-full p-5'>
              {items && items.map((item: any) => (
                <div key={item._id} className="flex justify-center">
                  <div className="rounded-lg shadow-lg md:w-64 lg:max-w-sm">
                    {item.image ? (<NextLink href={`/id/${item._id}`}>
                      <SanityImage
                        image={item.image}
                        alt={''}
                      />
                    </NextLink>) : null}
                    <div className="p-6 bg-white dark:bg-black">
                      <h5 className="text-xl font-medium mb-2"><NextLink href={`/id/${item._id}`}>{item.label[locale || ''] || 'Missing title'}</NextLink></h5>
                      <p className="text-base mb-4">
                        {item.referredToBy?.[locale || '']}
                      </p>
                      {/* <pre>{JSON.stringify(item, null, 2)}</pre> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>

          <Footer />
        </Pane>
      </Layout>
    </>
  );
};

export default Browse;
