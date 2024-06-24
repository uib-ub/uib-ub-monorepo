import Link from "next/link";
import Footer from "../../components/layout/Footer"
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Tilbakemelding',
    description: '',
  }



export default function Feedback() {
    return (
        <>
        <main id="main" tabIndex={-1} className="flex flex-col w-full flex-grow">
        <div className="flex w-full shadow-md pb-2 justify-center"><Link href="https://skjemaker.app.uib.no/view.php?id=16665712" target="_blank">Åpne i nytt vindu</Link></div>
        <iframe className="flex-grow"  src="https://skjemaker.app.uib.no/view.php?id=16665712"/>
        
        </main>
        <Footer/>
        </>
    );
    }