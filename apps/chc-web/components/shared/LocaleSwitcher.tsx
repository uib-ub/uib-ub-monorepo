'use client'

import { usePathname } from 'next-intl/client'
import { Link } from 'next-intl'
import { i18n } from '../../i18n'
import { Boundary } from './Boundary'

export default function LocaleSwitcher({ locale }: { locale: string }) {
  const pathName = usePathname()
  const currentLocale = locale

  return (
    <Boundary color='orange' labels={['LanguageSwitcher (client)']} size='small'>
      <div>
        <p>Locale switcher:</p>
        <ul>
          {i18n.locales.map((locale) => {
            return (
              <li key={locale}>
                <Link href={pathName ?? '/'} locale={locale}>
                  {locale}
                </Link>
                {locale === currentLocale ? ' (current)' : ''}
                { }
              </li>
            )
          })}
        </ul>
      </div>
    </Boundary>
  )
}