"use client"

import React from 'react'
import { useSelectedLayoutSegment } from 'next/navigation'
import Link from "next/link"
import { cn } from "@/lib/utils"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '../../ui/navigation-menu'
import { mainNav } from '../config/nav-config'

export function MainNav({
  className,
}: Readonly<React.HTMLAttributes<HTMLElement>>) {
  const segmentRoot = useSelectedLayoutSegment();

  const menuButtonStyles = 'py-2 px-3'

  return (
    <NavigationMenu
      className={cn("hidden md:flex items-center justify-start space-x-4 lg:space-x-6", className)}
    >
      <NavigationMenuList>
        {mainNav.map((item) => (
          <React.Fragment key={item.label}>
            {item.href ? (
              <NavigationMenuItem>
                <Link href={`/${item.href}`} legacyBehavior passHref>
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), segmentRoot === item.href ? 'active' : '', menuButtonStyles)}>
                    {item.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ) : null
            }
            {item.items && (
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(navigationMenuTriggerStyle(), segmentRoot === item.href ? 'active' : '', menuButtonStyles)}>
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="right:0 absolute left-auto top-full w-auto border bg-zinc-100 dark:bg-zinc-900">
                  <ul className="grid gap-2 p-2 md:grid-cols-1 w-52">
                    {item.items?.map(subItem => (
                      <NavigationMenuItem key={subItem.label}>
                        <Link href={`/${subItem.href}`} legacyBehavior passHref>
                          <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), segmentRoot === subItem.href ? 'active' : '', menuButtonStyles)}>
                            {subItem.label}
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
          </React.Fragment>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
