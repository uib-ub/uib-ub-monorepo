import UiBLogo from "@/components/svg/UiBLogo"
import { PiArchiveThin, PiBookThin, PiDatabaseThin, PiMapTrifoldThin, PiTableThin } from 'react-icons/pi';
import Link from 'next/link';
import { PiMagnifyingGlass } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import Image from 'next/image';
import { datasetTitles, datasetPresentation, publishDates, datasetShortDescriptions } from '@/config/metadata-config';
import Footer from '../components/layout/footer';
import { fetchStats } from '@/app/api/_utils/actions';


export default async function Home() {

  const cards = [ 'bsn', 'hord', 'rygh', 'leks'].map(code => {
    const info = datasetPresentation[code]
    return { img: info.img, alt: info.alt, imageAttribution: info.imageAttribution, title: datasetTitles[code], code: code, description: datasetShortDescriptions[code], subindices: info.subindices, initMode: info.initMode }
  }
  )


  const newest = Object.entries(publishDates).sort((a, b) => b[1].localeCompare(a[1])).slice(0, 2).map(entry => entry[0]).map(code => {
    const info = datasetPresentation[code]
    return { img: info.img, alt: info.alt, imageAttribution: info.imageAttribution, title: datasetTitles[code], code: code, description: datasetShortDescriptions[code], subindices: info.subindices, initMode: info.initMode }
  }
  )

  const stats = await fetchStats()


  return (
    <>
<main id="main" tabIndex={-1} className="flex flex-col grow-1 gap-24 items-center justify-center pb-24 pt-4 md:pt-8 px-4 w-full flex-grow carta-marina bg-neutral-100 md:bg-transparent">
  <div className="flex flex-col w-full xl:w-auto gap-12 md:p-8 lg:py-8 w-fit self-center md:bg-white md:rounded-xl xl:rounded-full xl:aspect-square my-0 md:my-16 xl:my-0 md:bg-opacity-75 self align-middle justify-center">
  <div className="flex flex-col gap-8 md:px-8">
  <div className="flex flex-col gap-8">
    <div className="flex flex-col gap-4">
  <h1 className="self-center text-4xl text-neutral-900 sr-only md:not-sr-only">Stadnamnportalen</h1>
  
  <form className="grid grid-cols-4 md:grid-cols-6 items-center justify-center gap-3" action="search">
   
    <label htmlFor="search_input" className="sr-only">Søk i alle stedsnavn</label>
    <input id="search_input" className="col-span-3 md:col-span-5 rounded-md h-12 border border-gray-400 text-base px-2" name="q" type="text"/>
    <input type="hidden" name="section" value="results"/>
    <IconButton className="btn btn-primary col-span-1 text-base h-full" type="submit" label="Søk"><PiMagnifyingGlass className="text-xl"/></IconButton>
  </form>
  </div>
  

  { stats && <ul className="text-neutral-900 font-serif small-caps flex items-center justify-center flex-col sm:flex-row gap-4 lg:gap-6">
  <li className="flex flex-col items-center text-base">
      Stadnamnoppslag
      <span className="text-2xl">{stats?.snidCount?.toLocaleString('nb-NO')}</span>
    </li>
    
    <li className="flex flex-col items-center text-base">
      Datasett
      <span className="text-2xl">{stats?.datasetCount?.toLocaleString('nb-NO')}</span>
    </li>
    <li className="flex flex-col items-center text-base">
      Oppslag i datasetta
      <span className="text-2xl">{stats?.datasetDocs?.toLocaleString('nb-NO')}</span>
    </li>
    
  </ul> }
  

  </div>
  </div>



</div>


    <nav className="grid grid-cols-1 lg:grid-cols-2 w-full lg:w-auto justify-center items-center gap-4 lg:gap-8 text-xl lg:text-lg">
  <Link href="/search?mode=map" className="flex lg:flex-col col-span-1 w-full items-center no-underline bg-white opacity-90 rounded-md p-4 whitespace-nowrap gap-4 lg:gap-2"><PiMapTrifoldThin aria-hidden="true" className="text-6xl text-primary-600"/><span>Utforsk kartet</span></Link>
  {false && <>
  <Link href="/info/datasets" className="flex invisible lg:flex-col col-span-1 w-full items-center bg-white opacity-90 rounded-md p-4 no-underline whitespace-nowrap gap-4 lg:gap-2"><PiBookThin aria-hidden="true" className="text-6xl text-primary-600"/><span>Leksikon [kommer snart]</span></Link>
  <Link href="/iiif" className="flex invisible lg:flex-col col-span-1 w-full items-center no-underline bg-white opacity-90 rounded-md p-4 whitespace-nowrap gap-4 lg:gap-2"><PiArchiveThin aria-hidden="true" className="text-6xl text-primary-600"/><span>Arkivressurser [kommer snart]</span></Link>
  </>}
  <Link href="/info/datasets" className="flex lg:flex-col col-span-1 w-full items-center bg-white opacity-90 rounded-md p-4 no-underline whitespace-nowrap gap-4 lg:gap-2"><PiDatabaseThin aria-hidden="true" className="text-6xl text-primary-600"/><span>Datasett</span></Link>

  </nav>


<div className="flex items-center justify-center flex-col lg:flex-row gap-12">
  <div className="flex flex-col md:flex-row items-center gap-6 text-neutral-950 "><UiBLogo/><div className="flex flex-col gap-1 text-center md:text-left"><h2 className="tracking-widest font-serif">UNIVERSITETET I BERGEN</h2><em className="font-serif">Universitetsbiblioteket</em></div>
  </div>
  <div className="flex flex-col md:flex-row gap-6 jusitfy-between text-center">
  <div className="flex flex-col"><span className="font-semibold">Språksamlingane</span>
  <Link href="https://spraksamlingane.no" className="text-sm">spraksamlingane.no</Link></div>
  <div className="flex flex-col"><span className="font-semibold">Digital utvikling</span>
  <Link href="https://uib.no/digitalutvikling" className="text-sm">uib.no/digitalutvikling</Link></div>

  </div>
  </div>
  <div className="flex flex-col items-center container gap-24">
  <section className="flex flex-col  gap-6" aria-labelledby="recently_added">
    <h2 id="recently_added" className="font-serif text-3xl text-neutral-900">Sist lagt til</h2>
    <ul className="flex flex-col gap-6 xl:grid xl:grid-cols-2">
      {newest.map((card, index) => (
        <li key={index} className="bg-white shadow-lg p-4 xl:col-span-1 items-start rounded-lg">
          <Link className="no-underline group flex flex-col md:flex-row xl:flex-row" href={`search?dataset=${card.code}&nav=datasets`}>
            <div className="overflow-hidden w-full md:h-[18rem] md:w-[18rem] shrink-0 aspect-square rounded-md">
              <Image src={card.img} alt="Illustrasjon" aria-describedby={card.code + "_attribution"} height="512" width="512" className="sepia-[25%] grayscale-[50%] object-cover !h-full !w-full"/>
            </div>
            <div className="py-4 md:px-6 pb-0 flex flex-col">
              <h3 className="text-2xl group-hover:underline decoration-2 decoration-primary-400 underline-offset-4">{card.title}</h3>
              <p className="pt-2 text-small">{card.description}</p>
              <div id={card.code + "_attribution"} className="text-xs text-neutral-700 mt-auto">Illustrasjon: {card.imageAttribution}</div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
</section>
  <section className="flex flex-col gap-6" aria-labelledby="dataset_showcase">
    <h2 id="dataset_showcase" className="font-serif text-3xl text-neutral-900">Utvalde datasett</h2>
    <ul className="flex flex-col gap-6 xl:grid xl:grid-cols-2">
      {cards.map((card, index) => (
        <li key={index} className="bg-white shadow-lg p-4 xl:col-span-1 items-start rounded-lg">
          <Link className="no-underline group flex flex-col md:flex-row xl:flex-row" href={`search?dataset=${card.code}&nav=datasets`}>
            <div className="overflow-hidden w-full md:h-[18rem] md:w-[18rem] shrink-0 aspect-square rounded-md">
              <Image src={card.img} alt="Illustrasjon" aria-describedby={card.code + "_attribution"} height="512" width="512" className="sepia-[25%] grayscale-[50%] object-cover !h-full !w-full"/>
            </div>
            <div className="py-4 md:px-6 pb-0 flex flex-col">
              <h3 className="text-2xl group-hover:underline decoration-2 decoration-primary-400 underline-offset-4">{card.title}</h3>
              <p className="pt-2 text-small">{card.description}</p>
              <div id={card.code + "_attribution"} className="text-xs text-neutral-700 mt-auto">Illustrasjon: {card.imageAttribution}</div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
</section>
    </div>
  

</main>
      <Footer/>
      </>
  );
}
