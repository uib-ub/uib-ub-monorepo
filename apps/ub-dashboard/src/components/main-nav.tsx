"use client"

import { useSelectedLayoutSegment } from 'next/navigation'
import Link from "next/link"
import { cn } from "@/lib/utils"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from './ui/navigation-menu'

export type MainNavProps = {
  href: string
  label: string
}

const menuItems: MainNavProps[] = [
  { href: "persons", label: "Personer" },
  { href: "groups", label: "Grupper" },
  { href: "projects", label: "Prosjekt" },
  { href: "timeline", label: "Tidslinje" },
  { href: "software", label: "Programvare" },
  { href: "links", label: "Lenker" },
]

export function MainNav({
  className,
}: React.HTMLAttributes<HTMLElement>) {
  const segmentRoot = useSelectedLayoutSegment();

  return (
    <NavigationMenu
      className={cn("flex items-center justify-start space-x-4 lg:space-x-6 overflow-x-scroll", className)}
    >
      <NavigationMenuList>
        {menuItems.map((item) => (
          <NavigationMenuItem key={item.label}>
            <Link href={`/${item.href}`} legacyBehavior passHref>
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), segmentRoot === item.href ? 'active' : '')}>
                {item.label}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
