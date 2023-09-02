'use client'
import Link from 'next-intl/link';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { usePathname } from 'next/navigation';

export const NavLink = ({ href, children, ...props }: { href: string, children: React.ReactElement }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <NavigationMenu.Link
      active={isActive}
      {...props}
      asChild
    >
      <Link href={href}>
        {children}
      </Link>
    </NavigationMenu.Link>
  );
};