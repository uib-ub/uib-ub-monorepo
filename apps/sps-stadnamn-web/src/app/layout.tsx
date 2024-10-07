import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Menu from "./Menu";
import NavBar from "./NavBar";
import { Open_Sans, Cormorant_Garamond } from 'next/font/google'
import { Suspense } from "react";
import PlausibleProvider from 'next-plausible'
import { PiHouseFill } from "react-icons/pi";
import { userAgent } from "next/server";
import { headers } from "next/headers";
import MobileFormSection from "@/components/search/formSection/Form";
import Form from "@/components/search/formSection/Form";
 
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
        <header className="flex lg:justify-between text-neutral-900 w-full bg-neutral-50 relative shadow-md !h-12 flex-none items-center !z-[4000]">

          <Form isMobile={isMobile}/>
          
          <Suspense>
            <Menu/>
          </Suspense>
          <NavBar className={`hidden xl:flex text-lg xl:text-xl px-4 items-center shrink-0 small-caps gap-3 font-semibold items-center mb-1 !min-w-[25svw] justify-end`}/>
        </header>
        {children}
      </body>
    </html>
  );
}
