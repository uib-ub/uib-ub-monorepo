import UiBLogo from "@/components/svg/UiBLogo"
import { PiMapTrifold, PiDatabase } from 'react-icons/pi';
import Link from 'next/link';
import { PiMagnifyingGlass } from 'react-icons/pi';

export default function Home() {
  const cards = [
    { img: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Prof_oluf_rygh.jpg", title: "Oluf Rygh: Norske Gaardnavne", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
    { img: "https://via.placeholder.com/150", title: "Matrikkelen 1886", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
    { img: "https://via.placeholder.com/150", title: "Bustadnamn", description: "Description" },
    { img: "https://via.placeholder.com/150", title: "Bustadnamn", description: "Description" },
    { img: "https://via.placeholder.com/150", title: "Bustadnamn", description: "Description" },
    { img: "https://via.placeholder.com/150", title: "Bustadnamn", description: "Description" },
    { img: "https://via.placeholder.com/150", title: "Bustadnamn", description: "Description" },
  ];

  return (
    <>
<main className="flex flex-col grow-1 gap-24 items-center justify-center pb-8 lg:pt-32  lg:pb-16 px-4 my-auto">
  <div className="flex flex-col gap-12 my-2">
  <div className="flex flex-col gap-6 items-center">
  <h1 className="text-2xl sm:text-3xl text-slate-900 md:text-4xl lg:text-5xl font-serif">Stedsnavnsøk</h1>
  
  <form className="grid grid-cols-5 md:grid-cols-7 items-center justify-center max-w-2xl mx-auto gap-2" action="search/stadnamn">

    <input className="col-span-4 rounded-sm h-full border border-gray-400 text-base px-4" name="q" type="text"/>
    <button className="btn btn-primary h-full col-span-1 text-base" type="submit" aria-label="Søk"><PiMagnifyingGlass aria-hidden='true' className="text-lg"/></button>
    <button className="btn text-base col-span-5 md:col-span-2 whitespace-nowrap"><PiMapTrifold aria-hidden='true' className="mr-2"/>Utforsk kartet</button>
  </form>
  
  </div>

  </div>

  <div className="flex items-center flex-col lg:flex-row gap-12">
  <div className="flex flex-col md:flex-row items-center gap-6 text-slate-950 "><UiBLogo/><div className="flex flex-col gap-1 text-center md:text-left"><h2 className="tracking-widest font-serif">UNIVERSITETET I BERGEN</h2><em className="font-serif">Universitetsbiblioteket</em></div>
  </div>
  <div className="flex flex-col md:flex-row gap-6 jusitfy-between text-center">
  <div className="flex flex-col"><span className="font-semibold">Språksamlingene</span>
  <Link href="https://uib.no/spraksamlingane" className="text-sm">uib.no/spraksamlingane</Link></div>
  <div className="flex flex-col"><span className="font-semibold">Digital utvikling</span>
  <Link href="https://uib.no/digitalutvikling" className="text-sm">uib.no/digitalutvikling</Link></div>

  </div>
  


  </div>
  <section className="flex flex-col items-center gap-6">
    <h2 className="font-serif text-3xl">Datasett</h2>
    Filtre her
    <ul className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <li key={index} className="card flex">
          <img src={card.img}  alt="Image description" className="w-24 h-24 md:w-48 md:h-48 object-cover m-2"/>
          <div className="content p-4 w-128">
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p>{card.description}</p>
          </div>
        </li>
      ))}
    </ul>
    </section>
  

</main>
        <footer className="bg-slate-200  p-6 text-center">
        
        <nav className="flex flex-col md:flex-row gap-3">
          <Link href="/">Personvern</Link>
          <Link href="/">Tilgjengelighetserklæring</Link>
        </nav>
        
      </footer>
      </>
  );
}
