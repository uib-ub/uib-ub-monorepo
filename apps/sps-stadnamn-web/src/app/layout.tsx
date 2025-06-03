import type { Metadata } from "next";
import "./globals.css";
import Menu from "./menu";
import NavBar from "./nav-bar";
import { Open_Sans, Cormorant_Garamond } from 'next/font/google'
import { Suspense } from "react";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import PlausibleProvider from 'next-plausible'
import { userAgent } from "next/server";
import { headers } from "next/headers";
import SearchForm from "@/components/search/form/search-form";
import GlobalProvider from "./global-provider";
import { fetchSOSIVocab } from "./api/_utils/actions";
 
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const device = userAgent({ headers: headersList }).device;
  const isMobile = device.type === 'mobile'

  const sosiVocab = await fetchSOSIVocab();


  return (
    <html lang="no" className={`${garamond.variable} ${opensans.className} h-full w-full`}>
      <head>
        <PlausibleProvider domain="stadnamnportalen.uib.no" />
      </head>
      <body className="flex flex-col w-full h-full relative">
        
        <NuqsAdapter>
        <GlobalProvider isMobile={isMobile} sosiVocab={sosiVocab}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[5001] focus:top-1 focus:py-3 focus:px-6 bg-primary-700 text-white no-underline self-center">
        Gå til hovudinnhald
      </a>
        <header className="flex lg:justify-between text-neutral-900 w-full bg-neutral-50 relative shadow-md !h-12 flex-none items-center !z-[4000]">

          <SearchForm/>
          <Suspense>
            <Menu/>
          </Suspense>
          <NavBar className={`hidden xl:flex lg:min-w-[calc(25svw+0.5rem)] text-lg xl:text-xl px-4 items-center shrink-0 small-caps gap-3 font-semibold mb-1 justify-end`}/>
        </header>
        {children}
        </GlobalProvider>
        </NuqsAdapter>
        
      </body>
    </html>
  );
}
