import UiBLogo from "@/components/svg/UiBLogo"
import { PiArchive, PiArchiveFill, PiDatabase, PiDatabaseFill, PiDatabaseThin, PiMapTrifold, PiMapTrifoldFill, PiTable, PiTableFill } from 'react-icons/pi';
import Link from 'next/link';
import { PiMagnifyingGlass } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import Image from 'next/image';
import { datasetTitles, datasetPresentation, datasetDescriptions, publishDates, datasetShortDescriptions } from '@/config/metadata-config';
import Footer from '../components/layout/footer';
import { fetchStats } from '@/app/api/_utils/actions';
import { redirect } from "next/navigation";
import { userAgent } from "next/server";
import { headers } from "next/headers";


export default async function Home({ searchParams } : { searchParams?: Promise<{q: string, d: string}> }) {
  const headersList = await headers();
  const device = userAgent({ headers: headersList }).device;
  const isMobile = device.type === 'mobile'
  const { q: legacyQ, d: legacyD } = await searchParams || {}

  // Redirect legacy search params from Toponymi
  if (legacyQ) {
    const newSearchParams: Record<string,string> = { q: legacyQ }
    if (legacyD) {
      newSearchParams['datasets'] = legacyD
    }
    redirect('/view/search?' + new URLSearchParams(newSearchParams).toString())
    
  }


  const cards = [ 'bsn', 'hord', 'rygh', 'leks'].map(code => {
    const info = datasetPresentation[code]
    return { img: info.img, alt: info.alt, imageAttribution: info.imageAttribution, title: datasetTitles[code], code: code, description: isMobile ? datasetShortDescriptions[code] : datasetDescriptions[code], subindices: info.subindices, initPage: info.initPage }
  }
  )


  const newest = Object.entries(publishDates).sort((a, b) => b[1].localeCompare(a[1])).slice(0, 2).map(entry => entry[0]).map(code => {
    const info = datasetPresentation[code]
    return { img: info.img, alt: info.alt, imageAttribution: info.imageAttribution, title: datasetTitles[code], code: code, description: isMobile? datasetShortDescriptions[code] : datasetDescriptions[code], subindices: info.subindices, initPage: info.initPage }
  }
  )

  const stats = await fetchStats()


  return (
    <>
<main id="main" tabIndex={-1} className="flex flex-col grow-1 gap-14 items-center justify-center pb-24 pt-4 md:pt-8 px-4 w-full flex-grow carta-marina bg-neutral-100 md:bg-transparent">
  <div className="flex flex-col gap-12 md:p-8 md:py-16 lg:py-8 w-fit self-center md:bg-white md:rounded-xl xl:rounded-full xl:aspect-square my-0 md:my-16 xl:my-0 md:bg-opacity-75 self align-middle justify-center">
  <div className="flex flex-col gap-8 md:px-8">
  <div className="flex flex-col gap-8">
  <h1 className="text-2xl sm:text-3xl self-center md:text-4xl lg:text-4xl text-neutral-900 sr-only md:not-sr-only">Stadnamnportalen</h1>
  
  <form className="grid grid-cols-4 md:grid-cols-6 items-center justify-center gap-3" action="search">
    <label htmlFor="search_input" className="sr-only">Søk i alle stedsnavn</label>
    <input id="search_input" className="col-span-3 md:col-span-5 rounded-md h-12 border border-gray-400 text-base px-2" name="q" type="text"/>
    <IconButton className="btn btn-primary col-span-1 text-base h-full" type="submit" label="Søk"><PiMagnifyingGlass className="text-xl"/></IconButton>
  </form>
  

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


    <nav className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full md:w-auto justify-center items-center gap-8 text-lg">
  <Link href="/search" className="flex lg:flex-col col-span-1 w-full items-center no-underline bg-white opacity-90 rounded-md p-4 whitespace-nowrap gap-2"><PiMapTrifold aria-hidden="true" className="text-6xl text-neutral-800"/><span>Kartvisning</span></Link>
  <Link href="/table" className="flex lg:flex-col col-span-1 w-full items-center no-underline bg-white opacity-90 rounded-md p-4 whitespace-nowrap gap-2"><PiTable aria-hidden="true" className="text-6xl text-neutral-800"/><span>Tabellvisning</span></Link>
  <Link href="/iiif" className="flex lg:flex-col col-span-1 w-full items-center no-underline bg-white opacity-90 rounded-md p-4 whitespace-nowrap gap-2"><PiArchive aria-hidden="true" className="text-6xl text-neutral-800"/><span>Arkivressurser</span></Link>
  <Link href="/info/datasets" className="flex lg:flex-col col-span-1 w-full items-center bg-white opacity-90 rounded-md p-4 no-underline whitespace-nowrap gap-2"><PiDatabase aria-hidden="true" className="text-6xl text-neutral-800"/><span>Datasett</span></Link>
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

 
  

  <section className="flex flex-col items-center gap-12 mt-24" aria-labelledby="dataset_showcase">
    <h2 id="dataset_showcase" className="font-serif text-3xl">Sist lagt til</h2>
    <ul className="flex flex-col gap-6 xl:grid xl:grid-cols-2">
      {newest.map((card, index) => (
        <li key={index} className="bg-white shadow-lg  p-1 xl:col-span-1 items-start">
          <Link className=" no-underline group flex flex-col md:flex-row xl:flex-row" href={'view/' + card.code + (card.subindices?.length || card.initPage == 'info' ? '/info' : '')}>
          <div>
            <div className="overflow-hidden w-full md:h-[18rem] md:w-[18rem] shrink-0 aspect-square">
            <Image src={card.img} alt="Illustrasjon" aria-describedby={card.code + "_attribution"} height="512" width="512" className="sepia-[25%] grayscale-[50%] object-cover !h-full !w-full"/>
            </div>
            <div id={card.code + "_attribution"} className="text-xs text-neutral-700 w-full mt-1">{card.imageAttribution}</div>
          </div>

            <div className=" py-4 px-6">
              <h3 className="text-2xl group-hover:underline decoration-1 decoration-primary-600 underline-offset-4">{card.title}</h3>
              <p className="pt-2 text-small">{card.description}</p>
              
            </div>
          </Link>
        </li>
      ))}
    </ul>
  </section>
  <section className="flex flex-col items-center gap-12" aria-labelledby="dataset_showcase">
    <h2 id="dataset_showcase" className="font-serif text-3xl">Utvalde datasett</h2>
    <ul className="flex flex-col gap-6 xl:grid xl:grid-cols-2">
      {cards.map((card, index) => (
        <li key={index} className="bg-white shadow-lg p-1 xl:col-span-1 items-start">
          <Link className=" no-underline group flex flex-col md:flex-row xl:flex-row" href={'view/' + card.code + (card.subindices?.length || card.initPage == 'info' ? '/info' : '')}>
          <div className="">
            <div className="overflow-hidden w-full md:h-[18rem] md:w-[18rem] shrink-0 aspect-square">
            <Image src={card.img} alt="Illustrasjon" aria-describedby={card.code + "_attribution"} height="512" width="512" className="sepia-[25%] grayscale-[50%] object-cover !h-full !w-full"/>
            </div>
            <div id={card.code + "_attribution"} className="text-xs text-neutral-700 w-full mt-1">{card.imageAttribution}</div>
          </div>

            <div className=" py-4 px-6">
              <h3 className="text-2xl group-hover:underline decoration-1 decoration-primary-600 underline-offset-4">{card.title}</h3>
              <p className="pt-2 text-small">{card.description}</p>
              
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
