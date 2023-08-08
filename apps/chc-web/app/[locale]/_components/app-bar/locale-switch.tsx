'use client'

import { Languages } from 'lucide-react'
import { usePathname } from 'next-intl/client'
import Link from 'next-intl/link'
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from 'ui-react'

const i18n = {
  defaultLocale: 'no',
  locales: ['no', 'en'],
}

export default function LocaleSwitch({ locale }: { locale: string }) {
  const pathName = usePathname()
  const currentLocale = locale

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-5 px-0">
          <Languages className="rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 py-2 w-9 px-0" />
          <span className="sr-only">Choose language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {i18n.locales.map((locale) => {
          return (
            <DropdownMenuItem key={locale}>
              <Link href={pathName ?? '/'} locale={locale}>
                {locale}
              </Link>
              {locale === currentLocale ? ' (current)' : ''}
              { }
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
