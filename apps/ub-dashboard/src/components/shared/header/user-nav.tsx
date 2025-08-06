import React from 'react'
import initials from "initials"
import Link from "next/link"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOut } from '../../auth/logout-button'
import { ModeToggle } from '../theme-toggle'

export function UserNav({ user }: Readonly<{ user?: { name: string, email: string, picture?: string } }>) {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 dark:bg-zinc-700">
          <Avatar className="h-9 w-9 rounded-none">
            <AvatarImage src={user?.picture} alt={user?.name} />
            <AvatarFallback className='rounded-sm bg-inherit'>{initials(user?.name ?? '?')}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/studio`} accessKey="s" target={'_blank'} className="cursor-pointer">Studio <DropdownMenuShortcut>⇧S</DropdownMenuShortcut></Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <ModeToggle />

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <SignOut />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}