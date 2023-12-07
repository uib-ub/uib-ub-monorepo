import Link from 'next/link'
import { MainNav } from '@/components/shared/main-nav'
import LoginButton from '@/components/auth/login-button'
import { UserNav } from '@/components/shared/user-nav'
import { getServerSession } from "next-auth";
import { GlobalCommand } from './global-command';
import { sanityFetch } from '@/sanity/lib/fetch';
import { groq } from 'next-sanity';

interface Session {
  user?: {
    name: string;
    email: string;
  };
}

export const Header = async () => {
  const session: Session = (await getServerSession()) ?? {};

  const query = groq`*[_type in ["Actor", "Project", "Group", "Software"]] | order(label, asc) {
    "id": _id,
    "type": _type,
    label,
  }`
  const data = await sanityFetch<any[]>({ query, tags: ["Actor", "Project", "Group", "Software"] })


  return (
    <header className="flex items-center px-4 py-2 border-b">
      <div className='flex-grow-0 font-bold mr-5 dark:text-zinc-200'><Link href={`/`}>UB <span className='hidden sm:inline'>dashboard</span></Link></div>

      <MainNav className='flex-grow' />

      <div className="ml-auto pl-3 flex items-center space-x-2">
        <GlobalCommand data={data} />

        {Object.keys(session).length === 0 ? (
          <LoginButton />
        ) : (
          <UserNav user={session.user} />
        )}
      </div>
    </header>
  )
}