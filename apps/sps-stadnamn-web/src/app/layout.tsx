import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Menu from "./Menu";
import NavBar from "./NavBar";
import { Open_Sans, Cormorant_Garamond } from 'next/font/google'
import { Suspense } from "react";
import PlausibleProvider from 'next-plausible'
 
const garamond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ["400", "600", "700"],
  display: 'swap',
  variable: '--font-garamond',
})

const opensans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
})
 

export const metadata: Metadata = {
  title: {
    template: "%s - Stadnamnportalen",
    default: "Stadnamnportalen"
  },
  description: "Søketjeneste for norske stedstnavn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className={`${garamond.variable} ${opensans.className} h-full w-full`}>
      <head>
        <PlausibleProvider domain="stadnamn.uib.no" />
      </head>
      <body className="flex flex-col w-full h-full relative">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[3001] focus:top-1 focus:py-3 focus:px-6 focus:bg-primary-700 text-white no-underline self-center">
        Gå til hovudinnhald
      </a>
        <header className="flex flex-col lg:flex-row lg:gap-6 py-2 px-1 lg:p-3 lg:px-4 text-neutral-900 w-full relative">
          <div className="flex flex-wrap pl-3 md:justify-between h-full items-center">
          
          <Link href="/" className="text-2xl pt-1 small-caps font-serif h-full lg:pt-0">Stadnamnportalen</Link>
          <Suspense>
            <Menu/>
          </Suspense>
          </div>
          <NavBar className={`hidden text-lg xl:text-xl mx-4 align-text-middle lg:flex small-caps gap-3 font-semibold ml-auto`}/>
        </header>
        {children}
      </body>
    </html>
  );
}
