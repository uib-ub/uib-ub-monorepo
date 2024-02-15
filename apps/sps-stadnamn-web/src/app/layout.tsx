import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Menu from "./Menu";
import NavBar from "./NavBar";
import { Open_Sans, Cormorant_Garamond } from 'next/font/google'
 
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
  title: "Norske stadnamn",
  description: "Søketjeneste for norske stedstnavn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className={`${garamond.variable} ${opensans.className}`}>
      <body className="flex flex-col">
        <header className="flex flex-col lg:flex-row lg:gap-6 py-2 px-1 lg:p-3 lg:px-4 text-neutral-900 align-middle">
          <div className="flex flex-wrap pl-3 justify-between align-middle h-full">
          
          <Link href="/" className="sm:text-xl lg:text-2xl font-serif small-caps h-full pt-1 lg:pt-0">Norske stadnamn</Link>
          <Menu/>
          
          </div>
          <NavBar className={`hidden text-lg xl:text-xl mx-4 align-text-middle lg:flex gap-4 small-caps font-semibold ml-auto`}/>
        </header>
        {children}
      </body>
    </html>
  );
}
