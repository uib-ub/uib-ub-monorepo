import UiBLogo from "@/components/svg/UiBLogo"
import { PiMapTrifold, PiDatabase } from 'react-icons/pi';
import Link from 'next/link';
export default function Home() {
  return (
    <>
<main className="flex flex-col grow-1 gap-24 items-center justify-center  pt-4 pb-8 px-4 my-auto">
  <div className="flex flex-col gap-12 my-2">
  <div className="flex flex-col gap-6 items-center">
  <h1 className="text-2xl sm:text-3xl text-slate-900 md:text-4xl lg:text-5xl font-bold">Stedsnavnsøk</h1>
  
  <form className="flex items-center justify-center w-full max-w-md mx-auto" action="search/stadnamn">
    <input className="w-full mr-2 p-2 sm:p-3 md:p-4 lg:p-4 border border-gray-400 text-base sm:text-lg md:text-xl lg:text-2xl" name="q" type="text" placeholder="Search..." />
    <button className="btn btn-primary p-2 sm:p-3 md:p-4 lg:p-4 text-base sm:text-lg md:text-xl lg:text-2xl" type="submit">Søk</button>
  </form>
  </div>
  <div className="flex flex-col md:flex-row gap-12 justify-center">
  <button className="btn aspect-square flex flex-col text-xl"><PiMapTrifold className="text-9xl md:text-8xl"/>Utforsk kartet</button>
  <button className="btn aspect-square flex flex-col text-xl"><PiDatabase className="text-9xl md:text-8xl"/>Velg datasett</button>
  </div>
  </div>

  <div className="flex flex-row items-center gap-6 text-slate-800 "><UiBLogo/><div className="flex flex-col gap-1"><span className="">Språksamlingene<br/>Universitetet i Bergen</span><Link href="uib.no/spraksamlingane" className="text-sm">uib.no/spraksamlingane</Link></div></div>

</main>
        <footer className="bg-slate-900  p-3 px-6 text-white text-center">
        
        <nav className="flex flex-col md:flex-row gap-3">
          <Link href="/">Personvern</Link>
          <Link href="/">Tilgjengelighetserklæring</Link>
        </nav>
        
      </footer>
      </>
  );
}
