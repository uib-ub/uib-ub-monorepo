'use client'
import { nav } from '@/app/[locale]/_components/app-bar/nav'
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { NavLink } from '@/app/[locale]/_components/app-bar/nav-link';
import LocaleSwitch from '@/app/[locale]/_components/app-bar/locale-switch';
import { ThemeSwitch } from '@/app/[locale]/_components/app-bar/theme-switch';
import { UibUbNo } from 'assets';
import Link from 'next-intl/link';

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
      <Link href={`/menu`}>Menu</Link>
      <LocaleSwitch locale={locale} />
      <ThemeSwitch />
    </NavigationMenu.List>
  </NavigationMenu.Root>
);
