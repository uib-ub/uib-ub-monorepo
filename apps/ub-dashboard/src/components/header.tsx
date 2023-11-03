import Link from 'next/link'
import { MainNav } from '@/components/main-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import LoginButton from '@/components/auth/login-button'
import { UserNav } from '@/components/user-nav'
import { getServerSession } from "next-auth";

interface Session {
  user?: {
    name: string;
    email: string;
  };
}

export const Header = async () => {
  const session: Session = (await getServerSession()) ?? {};

  return (
    <header className="flex items-center px-4 py-2 border-b">
      <div className='flex-grow-0 font-bold mr-5 dark:text-zinc-200'><Link href={`/`}>UB <span className='hidden sm:inline'>dashboard</span></Link></div>

      <MainNav className='flex-grow' />

      <div className="ml-auto pl-3 flex items-center space-x-2">
        <ThemeToggle />

        {Object.keys(session).length === 0 ? (
          <LoginButton />
        ) : (
          <UserNav user={session.user} />
        )}
      </div>
    </header>
  )
}