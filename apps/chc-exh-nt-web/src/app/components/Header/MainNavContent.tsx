'use server'

import { Link } from '@/src/i18n/routing'
import { sanityFetch } from '@/src/sanity/lib/fetch'
import { mainNav } from '@/src/sanity/lib/queries/fragments'
import React from 'react'


async function getMenuData(lang: string) {
  try {
    return await sanityFetch({
      query: mainNav,
      params: { language: lang },
      perspective: 'published',
      stega: false
    })
  } catch (error) {
    console.error('Error fetching menu data:', error)
    return null
  }
}

export async function MainNavContent({ lang }: Readonly<{ lang: string }>) {
  const data = await getMenuData(lang)

  return (
    <ul className='gap-5 text-md dark:text-neutral-300 text-neutral-700 p-5'>
      {data?.sections?.map((section: any) => (
        <React.Fragment key={section._key}>
          {section?.label && (
            <li className='border-b text-md font-light first:mt-0 mt-4'>
              {section?.label?.[lang] || section?.target?.label?.[lang]}
            </li>
          )}
          {section?.target && (
            <li className='text-md font-light first:mt-0 mt-4'>
              {section?.target?.route &&
                <Link href={`/${section?.target?.route}`}>
                  {section?.target?.label?.[lang]}
                </Link>
              }
              {section?.target?.link &&
                <Link href={`${section?.target?.link}`}>
                  {section?.target?.label?.[lang]}
                </Link>
              }
            </li>
          )}
          <ul>
            {section?.links?.map((link: any) => (
              <li key={link._key} className='mt-1 pl-4'>
                {link?.target?.route && <Link href={`/${link?.target?.route}`}>
                  {link?.label?.[lang] || link?.target?.label?.[lang]}
                </Link>}
                {link?.target?.link && <Link href={`${link?.target?.link}`}>
                  {link?.label?.[lang] || link?.target?.label?.[lang]}
                </Link>}
              </li>
            ))}
          </ul>
        </React.Fragment>
      ))}
    </ul>
  )
} 