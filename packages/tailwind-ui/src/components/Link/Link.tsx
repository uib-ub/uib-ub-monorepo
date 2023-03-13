import React from "react";
import NextLink from 'next/link'

type Props = {
  href: string
  className?: string
  children: string
}

export const Link: React.FC<Props> = ({ href, className, children }) => {
  return (
    <NextLink href={href} passHref prefetch={false} className={`${className} text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-400`}>
      {children}
    </NextLink>
  )
}
