'use client'
import NextLink from 'next/link';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { usePathname } from 'next/navigation';
import styles from './nav-link.module.css'

export const NavLink = ({ href, children, ...props }: { href: string, children: React.ReactElement }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <NavigationMenu.Link
      className={styles.NavigationMenuLink}
      active={isActive}
      {...props}
      asChild
    >
      <NextLink href={href}>
        {children}
      </NextLink>
    </NavigationMenu.Link>
  );
};