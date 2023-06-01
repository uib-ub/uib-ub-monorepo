'use client'
import { nav } from 'components/globals/nav'
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { NavLink } from 'components/globals/app-bar/nav-link';
import LocaleSwitch from 'components/shared/locale-switch';
import ThemeSwitch from 'components/shared/theme-switch';

export default function AppBar({ locale }: { locale: string }) {
  return (
    <div className='flex gap-5 p-5'>
      <h1 className='font-extrabold text-2xl'>CHC</h1>
      <Navigation locale={locale} />
    </div>
  )
}


const Navigation = ({ locale }: { locale: string }) => (
  <NavigationMenu.Root className="relative z-[1] flex w-screen">
    <NavigationMenu.List className="m-0 flex gap-3 list-none p-1">
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
