import QueryProvider from "@/state/providers/query-provider";
import type { Metadata } from "next";
import PlausibleProvider from 'next-plausible';
import { Source_Sans_3, Source_Serif_4 } from 'next/font/google';
import { headers } from "next/headers";
import { userAgent } from "next/server";
import GlobalProvider from "../state/providers/global-provider";
import { fetchVocab } from "./api/_utils/actions";
import "./globals.css";

const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ["400", "700"],
  display: 'swap',
  variable: '--font-serif',
})

const sans = Source_Sans_3({
  weight: ["400", "600", "700"],
  subsets: ['latin'],
  display: 'swap'

})


export const metadata: Metadata = {
  title: {
    template: "%s - stadnamn.no",
    default: "stadnamn.no"
  },
  description: "Språksamlinganes nasjonale søketeneste for stadnamn, utvikla ved Universitetsbiblioteket i Bergen",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const device = userAgent({ headers: headersList }).device;
  const isMobile = device.type === 'mobile' || device.type === 'tablet'


  const { coordinateVocab, sosiVocab } = await fetchVocab();

  return (
    <html
      lang="no"
      className={`${serif.variable} ${sans.className}`}
    >
      <head>
        <PlausibleProvider domain="stadnamnportalen.uib.no" />
      </head>
      <body className="bg-neutral-900 flex flex-col min-h-[100svh] overflow-x-hidden">
        {/* Remove the Image component since we're using CSS background-image */}

        <GlobalProvider isMobile={isMobile} sosiVocab={sosiVocab || {}} coordinateVocab={coordinateVocab || {}}>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[5001] focus:top-1 focus:py-3 focus:px-6 bg-primary-700 text-white no-underline self-center">
            Gå til hovudinnhald
          </a>
          <QueryProvider>
            {children}
          </QueryProvider>
        </GlobalProvider>

      </body>
    </html>
  );
}
