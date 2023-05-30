'use client'
import styles from './app-bar.module.css'
import { nav } from 'components/globals/nav'
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { NavLink } from 'components/globals/app-bar/nav-link';
import LocaleSwitcher from 'components/shared/locale-switcher';

export default function AppBar({ locale }: { locale: string }) {
  return (
    <div className={styles.appBar}>
      <h1>CHC</h1>
      <Navigation locale={locale} />
    </div>
  )
}


const Navigation = ({ locale }: { locale: string }) => (
  <NavigationMenu.Root className={styles.NavigationMenu}>
    <NavigationMenu.List className={styles.NavigationMenuList}>
      {nav.mainNav.map((item: any) => (
        <NavigationMenu.Item key={item.name} className={styles.NavigationMenuItem}>
          <NavLink href={item.link}>
            {item.name}
          </NavLink>
        </NavigationMenu.Item>
      ))}
      <LocaleSwitcher locale={locale} />
    </NavigationMenu.List>
  </NavigationMenu.Root>
);