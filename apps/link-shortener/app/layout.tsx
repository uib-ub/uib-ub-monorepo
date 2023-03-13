import './globals.css'
import { Merriweather_Sans } from 'next/font/google'

const merriweathersans = Merriweather_Sans({
  subsets: ['latin'],
  variable: '--font-merriweathersans',
  fallback: ['Helvetica', 'ui-sans-serif', 'sans-serif'],
})

export default function RootLayout({ children, }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir='ltr' className={merriweathersans.variable}>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>{children}</body>
    </html>
  )
}
