import Head from 'next/head'
import { filterDataToSingleItem } from 'lib/functions'
import { getClient } from '../lib/sanity.server'
import { groq } from 'next-sanity'
import { routeQuery } from '../lib/queries/routeQuery'
import { TextBlocks } from '../components/TextBlocks'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { Hero, Layout, Link, MarcusIcon, Menu, Modal, Pane, UiBIcon } from 'tailwind-ui'
import NextLink from 'next/link'
import { MainNav } from '../components/Header/MainNav'
import SanityImage from '../components/SanityImage'
import { ArrowTopRightOnSquareIcon, Bars4Icon } from '@heroicons/react/24/outline'
import { Footer } from '../components/Footer'

export const Page = ({ page, label, description, locale, defaultLocale }: { page: any, label: string, description: string, locale: string, defaultLocale: string }) => {
  return (
    <>
      <Head>
        <title>{label[locale || 'no']}</title>
        <meta name="description" content={description[locale || 'no']} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout
        data={page}
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
          <main className='flex flex-col mt-5 mb-20'>
            <Hero
              label={slug?.label}
              image={aboutImage || heroImage || null}
              figCaption={
                <figcaption className='flex gap-1 justify-end mt-1 font-light text-sm text-neutral-500 dark:text-neutral-400'>
                  <TextBlocks value={slug?.about?.description} />
                  <div key={slug?.about?._id}>
                    <p className='font-light text-sm'>
                      <i>
                        <Link href={`/id/${slug?.about?._id}`}>
                          {slug?.about?.label[locale ?? ''] || slug?.about?.label[defaultLocale ?? ''] || 'Missing default language label'}
                        </Link>
                      </i>

                      {/* {slug?.about?.hasCurrentOwner?.length && `. ${slug?.about?.hasCurrentOwner[0].label[locale ?? ''] ?? slug?.about.objectMetadata?.hasCurrentOwner[0].label[defaultLocale ?? '']}.`} */}
                    </p>
                  </div>
                </figcaption>
              }
              creators={slug?.creator}
              locale={locale || ''}
            />

            <div className='mt-5 mb-54 grid grid-cols-content font-light font-serif text-lg'>
              {linguisticDocumentBody && <TextBlocks value={linguisticDocumentBody} />}
            </div>
          </main>
          <Footer locale={locale} />
        </Pane>
      </Layout>
    </>)
}