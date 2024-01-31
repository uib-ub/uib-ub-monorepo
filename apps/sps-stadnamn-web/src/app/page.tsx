import UiBLogo from "@/components/svg/UiBLogo"
import { PiMapTrifold, PiDatabase } from 'react-icons/pi';
import Link from 'next/link';
export default function Home() {
  return (
    <>
<main className="flex flex-col grow-1 gap-24 items-center justify-center  pt-4 pb-8 px-4 my-auto">
  <div className="flex flex-col gap-12 my-2">
  <div className="flex flex-col gap-6 items-center">
  <h1 className="text-2xl sm:text-3xl text-slate-900 md:text-4xl lg:text-5xl font-serif">Stedsnavnsøk</h1>
  
  <form className="flex items-center justify-center w-full max-w-md mx-auto" action="search/stadnamn">
    <input className="w-full rounded-sm mr-2 p-2 sm:p-3 md:p-4 lg:p-4 border border-gray-400 text-base sm:text-lg md:text-xl lg:text-2xl" name="q" type="text"/>
    <button className="btn btn-primary p-2 sm:p-3 md:p-4 lg:p-4 text-base sm:text-lg md:text-xl lg:text-2xl" type="submit">Søk</button>
  </form>
  </div>
  <div className="flex flex-col md:flex-row gap-12 justify-center">
  <button className="btn aspect-square flex flex-col text-xl"><PiMapTrifold className="text-9xl md:text-8xl"/>Utforsk kartet</button>
  <button className="btn aspect-square flex flex-col text-xl"><PiDatabase className="text-9xl md:text-8xl"/>Velg datasett</button>
  </div>
  </div>

  <div className="flex flex-col items-center gap-6">
  <div className="flex flex-row items-center gap-6 text-slate-950 "><UiBLogo/><div className="flex flex-col gap-1"><h2 className="tracking-widest font-serif">UNIVERSITETET I BERGEN</h2><em className="font-serif">Universitetsbiblioteket</em></div>
  </div>
  <div className="flex gap-6 jusitfy-between">
  <div className="flex flex-col">Språksamlingene
  <Link href="https://uib.no/spraksamlingane" className="text-sm">uib.no/spraksamlingane</Link></div>
  <div className="flex flex-col">Digital utvikling
  <Link href="https://uib.no/digitalutvikling" className="text-sm">uib.no/digitalutvikling</Link></div>

  </div>
  </div>
  

</main>
        <footer className="bg-slate-200  p-3 px-6 text-center">
        
        <nav className="flex flex-col md:flex-row gap-3">
          <Link href="/">Personvern</Link>
          <Link href="/">Tilgjengelighetserklæring</Link>
        </nav>
        
      </footer>
      </>
  );
}
