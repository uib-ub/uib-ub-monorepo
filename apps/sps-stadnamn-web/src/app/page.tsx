import UiBLogo from "@/components/svg/UiBLogo"
import { PiMapTrifold } from 'react-icons/pi';
import Link from 'next/link';
import { PiMagnifyingGlass } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';

export default function Home() {
  const cards = [
    { img: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=2036&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", title: "Bustadnavnregisteret", code: 'bsn', description: "Description" },
    { img: "https://kartverket.no/historiske/3/3029_general_4_1872_560px.jpg", title: "Hordanamn", code: 'hord', description: "Description" },
    { img: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Prof_oluf_rygh.jpg", alt: "Oluf Rygh, portrettfoto", title: "Oluf Rygh: Norske Gaardnavne", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
    { img: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", title: "Den nasjonale stadnamnbasen", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
  ];

  return (
    <>
<main className="flex flex-col grow-1 gap-48 items-center justify-center pb-8 lg:pt-32 md:pt-16 sm:pt-8  lg:pb-16 px-4 w-full flex-grow">
  <div className="flex flex-col gap-24 w-full">
  <div className="flex flex-col gap-12 w-full">
  <div className="flex flex-col gap-6 md:items-center">
  <h1 className="text-2xl sm:text-3xl self-center text-neutral-900 md:text-4xl lg:text-5xl font-serif">Stedsnavnsøk</h1>
  
  <form className="grid grid-cols-5 md:grid-cols-7 items-center justify-center md:max-w-2xl md:mx-auto gap-2" action="search/*">

    <input className="col-span-4 rounded-sm h-full border border-gray-400 text-base px-2" name="q" type="text"/>
    <IconButton className="btn btn-primary h-full col-span-1 text-base" type="submit" label="Søk"><PiMagnifyingGlass aria-hidden='true' className="text-lg"/></IconButton>
    <button className="btn text-base col-span-5 md:col-span-2 whitespace-nowrap"><PiMapTrifold aria-hidden='true' className="mr-2"/>Utforsk kartet</button>
  </form>
  
  </div>

  </div>

  <div className="flex items-center justify-center flex-col lg:flex-row gap-12">
  <div className="flex flex-col md:flex-row items-center gap-6 text-neutral-950 "><UiBLogo/><div className="flex flex-col gap-1 text-center md:text-left"><h2 className="tracking-widest font-serif">UNIVERSITETET I BERGEN</h2><em className="font-serif">Universitetsbiblioteket</em></div>
  </div>
  <div className="flex flex-col md:flex-row gap-6 jusitfy-between text-center">
  <div className="flex flex-col"><span className="font-semibold">Språksamlingene</span>
  <Link href="https://spraksamlingane.no" className="text-sm">spraksamlingane.no</Link></div>
  <div className="flex flex-col"><span className="font-semibold">Digital utvikling</span>
  <Link href="https://uib.no/digitalutvikling" className="text-sm">uib.no/digitalutvikling</Link></div>

  </div>
  </div>
  


  </div>
  <section className="flex flex-col items-center gap-12 container" aria-labelledby="dataset_showcase">
    <h2 id="dataset_showcase" className="font-serif text-3xl">Utvalgte datasett</h2>
    <ul className="sm:grid sm:grid-cols-1 2xl:grid-cols-2 gap-6">
      {cards.map((card, index) => (
        <li key={index} className="card flex flex-col md:h-64 my-6 sm:my-0">
          <Link href={'search/' + card.code} className="flex flex-col sm:flex-row h-full w-full no-underline">
          <div className="w-full aspect-square sm:h-32 sm:w-32 sm:md:h-64 sm:md:w-64  lg:p-1 overflow-hidden sm:flex-none">
          <img src={card.img} alt={card.alt} className="object-cover w-full h-full sepia-[25%] grayscale-[50%]"/>
        </div>
          <div className="content p-4 w-128 flex flex-col">
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p>{card.description}</p>
            
          </div>
          </Link>
        </li>
      ))}
    </ul>
    <button className="btn btn-outline text-xl flex gap-2"><PiMagnifyingGlass className="text-2xl"/>Finn flere datasett</button>
    </section>
  

</main>
        <footer className="bg-neutral-200 p-6 text-center">
        
        <nav className="flex flex-col lg:flex-row gap-6 justify-center items-center">
          <Link href="/" className="text-center px-4 py-2 w-full lg:w-auto">Tilgjengelighetserklæring</Link>
          <Link href="/" className="text-center px-4 py-2 w-full lg:w-auto">Personvern</Link>
        </nav>
        
      </footer>
      </>
  );
}
