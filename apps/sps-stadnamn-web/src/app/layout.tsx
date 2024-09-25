import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Menu from "./Menu";
import NavBar from "./NavBar";
import { Open_Sans, Cormorant_Garamond } from 'next/font/google'
import { Suspense } from "react";
import PlausibleProvider from 'next-plausible'
import { PiHouseFill } from "react-icons/pi";
import SearchForm from "@/components/search/SearchForm";
import { userAgent } from "next/server";
import { headers } from "next/headers";
 
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
  const device = userAgent({headers: headers()}).device
  const isMobile = device.type === 'mobile'
  return (
    <html lang="no" className={`${garamond.variable} ${opensans.className} h-full w-full`}>
      <head>
        <PlausibleProvider domain="stadnamnportalen.uib.no" />
      </head>
      <body className="flex flex-col w-full h-full relative">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[3001] focus:top-1 focus:py-3 focus:px-6 focus:bg-primary-700 text-white no-underline self-center">
        Gå til hovudinnhald
      </a>
        <header className="flex lg:justify-between text-neutral-900 w-full bg-neutral-50 relative shadow-md h-12 itemx-center !z-[4000]">

          
          { isMobile ? <SearchForm showLink={true}/> : <Link href="/" className="text-2xl small-caps font-serif self-center lg:!ml-4">Stadnamnportalen</Link> }
          
          <Suspense>
            <Menu/>
          </Suspense>
          <NavBar className={`hidden text-lg xl:text-xl mx-4 align-text-middle lg:flex small-caps gap-3 font-semibold items-center mb-1`}/>
        </header>
        {children}
      </body>
    </html>
  );
}
