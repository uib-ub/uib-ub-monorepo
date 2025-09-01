import type { Metadata } from "next";
import "./globals.css";
import Menu from "./menu";
import NavBar from "./nav-bar";
import { Source_Sans_3, Source_Serif_4 } from 'next/font/google'
import { Suspense } from "react";
import PlausibleProvider from 'next-plausible'
import { userAgent } from "next/server";
import { headers } from "next/headers";
import SearchForm from "@/components/search/form/search-form";
import GlobalProvider from "./global-provider";
import { fetchVocab } from "./api/_utils/actions";
import QueryProvider from "@/state/providers/query-provider";
 
const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ["400", "700"],
  display: 'swap',
  variable: '--font-serif',
})

const sans = Source_Sans_3  ({
  weight: ["400", "600", "700"],
  subsets: ['latin'],
  display: 'swap'
  
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

  const { coordinateVocab, sosiVocab } = await fetchVocab();

  return (
    <html lang="no" className={`${serif.variable} ${sans.className} h-full w-full bg-neutral-900`}>
      <head>
        <PlausibleProvider domain="stadnamnportalen.uib.no" />
      </head>
      <body className="flex flex-col w-full h-full relative">
        
        <GlobalProvider isMobile={isMobile} sosiVocab={sosiVocab || {}} coordinateVocab={coordinateVocab || {}}>
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
         <QueryProvider>
        {children}
        </QueryProvider>
        </GlobalProvider>
        
      </body>
    </html>
  );
}
