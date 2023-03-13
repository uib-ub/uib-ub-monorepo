import React, { ReactElement } from 'react'
import { useTheme } from 'next-themes'
import { Select } from 'tailwind-ui'
import { useMounted } from '../hooks/use-mounted'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

type ThemeSwitchProps = {
  lite?: boolean
}

export function ThemeSwitch({ lite }: ThemeSwitchProps): ReactElement {
  const { theme, setTheme, systemTheme } = useTheme()
  const renderedTheme = theme === 'system' ? systemTheme : theme
  const mounted = useMounted()
  const IconToUse = mounted && renderedTheme === 'dark' ? MoonIcon : SunIcon

  return (
    <div className="relative">
      <Select
        title="Change theme"
        onChange={(option: any) => {
          setTheme(option.key)
        }}
        selected={{
          key: theme || '',
          name: (
            <div className="flex items-center gap-2 capitalize">
              <IconToUse className='w-4 h-4' />
              <span className={lite ? 'md:hidden' : ''}>
                {mounted ? theme : 'light'}
              </span>
            </div>
          )
        }}
        options={[
          { key: 'light', name: 'Light' },
          { key: 'dark', name: 'Dark' },
          { key: 'system', name: 'System' }
        ]}
      />
    </div>
  )
}