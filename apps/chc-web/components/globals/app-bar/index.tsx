'use client'
import { nav } from 'components/globals/nav'
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { NavLink } from 'components/globals/app-bar/nav-link';
import LocaleSwitch from 'components/shared/locale-switch';
import { ThemeSwitch } from 'components/shared/theme-switch';
import { UibUbNo } from 'assets';

export default function AppBar({ locale }: { locale: string }) {
  return (
    <div className='flex items-center gap-5 px-5'>
      <UibUbNo className='h-24 text:white' />
      <h1 className='sr-only'>CHC</h1>
      <Navigation locale={locale} />
    </div>
  )
}

// TODO: Use ui-react
const Navigation = ({ locale }: { locale: string }) => (
  <NavigationMenu.Root className="relative z-[1] flex w-screen">
    <NavigationMenu.List className="flex gap-3 items-center p-1">
      {nav.mainNav.map((item: any) => (
        <NavigationMenu.Item key={item.name}>
          <NavLink href={item.link}>
            {item.name}
          </NavLink>
        </NavigationMenu.Item>
      ))}
      <LocaleSwitch locale={locale} />
      <ThemeSwitch />
    </NavigationMenu.List>
  </NavigationMenu.Root>
);
