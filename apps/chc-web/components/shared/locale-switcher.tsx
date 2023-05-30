'use client'

import { usePathname } from 'next-intl/client'
import { Link } from 'next-intl'
import { i18n } from '../../i18n'

export default function LocaleSwitcher({ locale }: { locale: string }) {
  const pathName = usePathname()
  const currentLocale = locale

  return (
    <div>
      <ul style={{ display: 'flex', gap: '0.25em', listStyle: 'none' }}>
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
  )
}