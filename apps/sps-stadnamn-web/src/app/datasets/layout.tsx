import type { Metadata } from 'next'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
    title: 'Søkevisninger',
    description: 'Finn søkevisninger tilpassa dei einskilde datasetta',
  }


  
  export default function DatasetsLayout({ children }: { children: React.ReactNode } ) {  
    return (
        <>
      <main id="main" tabIndex={-1} className="flex flex-col grow-1 gap-48 items-center pb-8 lg:pt-32 md:pt-16 sm:pt-8  lg:pb-16 px-4 w-full flex-grow">
        {children}
      </main>
      <Footer/>
      </>

    )
  }