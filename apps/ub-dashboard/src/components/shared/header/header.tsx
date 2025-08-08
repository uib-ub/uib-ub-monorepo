import Link from 'next/link'
import { MainNav } from '@/components/shared/header/main-nav'
import { SignIn } from '@/components/auth/login-button'
import { UserNav } from '@/components/shared/header/user-nav'
import { auth } from "@/auth";
import { GlobalCommand } from './global-command';
import { sanityFetch } from '@/sanity/lib/fetch';
import { groq } from 'next-sanity';
import { MobileNav } from './mobile-nav';

export const Header = async () => {
  const session = await auth();

  const query = groq`*[_type in ["Actor", "Project", "Group", "Software"]] | order(label, asc) {
    "id": _id,
    "type": _type,
    label,
  }`
  const data = await sanityFetch({ query, tags: ["Actor", "Project", "Group", "Software"] })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 max-w-(--breakpoint-2xl) items-center">
        <div className='hidden md:inline grow-0 font-bold dark:text-zinc-200'>
          <Link href={`/`}>UB <span className='hidden xl:inline'>dashboard</span></Link>
        </div>
        <MainNav />
        <MobileNav />
        <div className='inline md:hidden grow-0 font-bold dark:text-zinc-200'>
          <Link href={`/`}>UB dashboard</Link>
        </div>
        <div className="flex flex-1 items-center space-x-2 justify-end">
          <GlobalCommand data={data} />

          {Object.keys(session || {}).length === 0 ? (
            <SignIn />
          ) : (
            <UserNav user={{
              name: session?.user?.name || '',
              email: session?.user?.email || '',
              picture: session?.user?.image || undefined
            }} />
          )}

        </div>
      </div>
    </header>
  )
}