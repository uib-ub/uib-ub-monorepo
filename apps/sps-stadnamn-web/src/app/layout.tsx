import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import NavBar from "./NavBar";
import { Open_Sans, Cormorant_Garamond } from 'next/font/google'
import SearchBar from "./SearchBar"
 
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
        <header className="flex flex-col md:flex-row gap-6 p-3 px-6 text-neutral-900 align-middle">
          <div className="flex justify-between align-middle h-full">
          <Link href="/" className="sm:text-xl md:text-2xl font-serif small-caps">Norske stadnamn</Link>
          <NavBar/>
          </div>
          <SearchBar/> 
                  
          


        </header>
        {children}
      </body>
    </html>
  );
}
