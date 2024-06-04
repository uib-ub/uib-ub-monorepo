import { GlobeAltIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import React from 'react'
import { Select } from './Select'

interface LocaleSwitchProps {
  lite?: boolean
  className?: string
  labels: {
    [key: string]: string
  }
}

export const LocaleSwitch: React.FC<LocaleSwitchProps> = ({
  lite,
  className,
  labels
}) => {
  const router = useRouter()
  const { locales, locale, asPath } = useRouter()
  const selected = locales!.find(l => locale === l)

  return (
    <div className="relative">
      <Select
        title="Change language"
        className={`${className}`}
        onChange={option => {
          const date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          document.cookie = `NEXT_LOCALE=${option.key
            }; expires=${date.toUTCString()}; path=/`

          router.push(asPath, asPath, { locale: option.key });
        }}
        selected={{
          key: selected ?? '',
          name: (
            <div className="flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4 dark:text-neutral-100" />
              <span className={lite ? 'hidden' : ''}>{labels[selected ?? '']}</span>
            </div>
          )
        }}
        options={locales!.map(locale => ({
          key: locale,
          name: labels[locale]
        }))}
      />
    </div>
  )
}

