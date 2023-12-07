"use client"

import { useSelectedLayoutSegment } from 'next/navigation'
import Link from "next/link"
import { cn } from "@/lib/utils"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '../ui/navigation-menu'

export type MainNavProps = {
  href: string
  label: string
}

const menuItems: MainNavProps[] = [
  { href: "persons", label: "Personer" },
  { href: "groups", label: "Grupper" },
  { href: "projects", label: "Prosjekt" },
  { href: "timeline", label: "Tidslinje" },
]

const toolsItems: MainNavProps[] = [
  { href: "software", label: "Programvare" },
  { href: "links", label: "Lenker" },
  { href: "link-shortener", label: "Kortlenker" },
  { href: "qa/validation/marcus", label: "Validering" },
]


export function MainNav({
  className,
}: Readonly<React.HTMLAttributes<HTMLElement>>) {
  const segmentRoot = useSelectedLayoutSegment();

  return (
    <NavigationMenu
      className={cn("flex items-center justify-start space-x-4 lg:space-x-6", className)}
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
        <NavigationMenuItem>
          <NavigationMenuTrigger className={cn(navigationMenuTriggerStyle(), segmentRoot === 'tools' ? 'active' : '')}>
            Ekstra
          </NavigationMenuTrigger>
          <NavigationMenuContent className="right:0 absolute left-auto top-full w-auto border bg-zinc-100 dark:bg-zinc-900">
            <ul className="grid w-[300px] gap-3 p-4 md:w-[350px] md:grid-cols-2 lg:w-[400px] ">
              {toolsItems.map((item) => (
                <NavigationMenuItem key={item.label}>
                  <Link href={`/${item.href}`} legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), segmentRoot === item.href ? 'active' : '')}>
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
