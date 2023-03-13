import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

type Props = {
  children: string | React.ReactNode
  href: string
}

export const NavLink: React.FC<Props> = ({ href, children }) => {
  const { asPath } = useRouter()
  const isActive = asPath === href

  return (
    <Link href={href} passHref className={`${isActive ? 'text-red-500' : ''}`}>
      {children}
    </Link>
  )
}

export default NavLink
