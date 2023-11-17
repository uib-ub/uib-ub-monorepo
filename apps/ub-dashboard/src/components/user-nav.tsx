"use client";
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
import { LogoutButton } from './auth/logout-button'
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"

export function UserNav({ user }: Readonly<{ user?: { name: string, email: string, picture?: string } }>) {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-zinc-100 hover:bg-zinc-200 hover:dark:bg-zinc-800 dark:bg-zinc-700">
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

        <DropdownMenuGroup className='flex flex-col gap-1'>
          <DropdownMenuItem onClick={() => setTheme("light")} className="bg-muted dark:bg-transparent dark:focus:bg-muted focus:bg-muted">
            <SunIcon className="h-[1.2rem] w-[1.2rem] dark:white rotate-0 scale-100 transition-all mr-2" /> Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")} className="dark:bg-muted">
            <MoonIcon className="h-[1.2rem] w-[1.2rem] dark:white rotate-0 scale-100 transition-all mr-2" /> Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <LogoutButton className="w-full justify-start cursor-pointer" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}