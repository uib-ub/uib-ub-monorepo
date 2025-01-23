import Link from 'next/link'
import { MainNav } from '@/components/shared/header/main-nav'
import LoginButton from '@/components/auth/login-button'
import { UserNav } from '@/components/shared/header/user-nav'
import { getServerSession } from "next-auth";
import { GlobalCommand } from './global-command';
import { sanityFetch } from '@/sanity/lib/fetch';
import { groq } from 'next-sanity';
import { MobileNav } from './mobile-nav';

interface Session {
  user?: {
    name: string;
    email: string;
  };
}

export const Header = async () => {
  const session: Session = (await getServerSession()) ?? {};
  console.log("🚀 ~ Header ~ session:", session)

  const query = groq`*[_type in ["Actor", "Project", "Group", "Software"]] | order(label, asc) {
    "id": _id,
    "type": _type,
    label,
  }`
  const data = await sanityFetch({ query, tags: ["Actor", "Project", "Group", "Software"] })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className='hidden md:inline flex-grow-0 font-bold dark:text-zinc-200'>
          <Link href={`/`}>UB <span className='hidden xl:inline'>dashboard</span></Link>
        </div>
        <MainNav />
        <MobileNav />
        <div className='inline md:hidden flex-grow-0 font-bold dark:text-zinc-200'>
          <Link href={`/`}>UB dashboard</Link>
        </div>
        <div className="flex flex-1 items-center space-x-2 justify-end">
          <GlobalCommand data={data} />

          {Object.keys(session).length === 0 ? (
            <LoginButton />
          ) : (
            <UserNav user={session.user} />
          )}

        </div>
      </div>
    </header>
  )
}
/*     <header className="flex flex-col ali px-4 py-2 border-b">
      <div className="flex items-center">
        <div className='flex-grow-0 font-bold mr-5 dark:text-zinc-200'>
          <Link href={`/`}>UB <span className='hidden md:inline'>dashboard</span></Link>
        </div>

        <MainNav className='hidden md:flex md:flex-grow' />

        <div className="ml-auto pl-3 flex items-center space-x-2">
      </div>
      <MainNav className='md:hidden flex items-start md:flex-grow' />
    </header> */