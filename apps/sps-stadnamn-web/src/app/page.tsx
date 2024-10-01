import UiBLogo from "@/components/svg/UiBLogo"
import { PiMapTrifold } from 'react-icons/pi';
import Link from 'next/link';
import { PiMagnifyingGlass } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import Image from 'next/image';
import { datasetTitles, datasetPresentation, datasetDescriptions, publishDates } from '@/config/metadata-config';
import Footer from '../components/layout/Footer';
import { fetchStats } from '@/app/api/_utils/actions';
import { redirect } from "next/navigation";


export default async function Home({ searchParams } : { searchParams?: {q: string, d: string} }) {

  // Redirect legacy search params from Toponymi
  if (searchParams?.q) {''
    const newSearchParams: Record<string,string> = { q: searchParams.q }
    if (searchParams.d) {
      newSearchParams['datasets'] = searchParams.d
    }
    redirect('/view/search?' + new URLSearchParams(newSearchParams).toString())
    
  }


  const cards = [ 'bsn', 'hord', 'rygh', 'leks'].map(code => {
    const info = datasetPresentation[code]
    return { img: info.img, alt: info.alt, imageAttribution: info.imageAttribution, title: datasetTitles[code], code: code, description: datasetDescriptions[code], subindices: info.subindices, initPage: info.initPage }
  }
  )


  const newest = Object.entries(publishDates).sort((a, b) => b[1].localeCompare(a[1])).slice(0, 2).map(entry => entry[0]).map(code => {
    const info = datasetPresentation[code]
    return { img: info.img, alt: info.alt, imageAttribution: info.imageAttribution, title: datasetTitles[code], code: code, description: datasetDescriptions[code], subindices: info.subindices, initPage: info.initPage }
  }
  )

  const stats = await fetchStats()


  return (
    <>
<main id="main" tabIndex={-1} className="flex flex-col grow-1 gap-48 items-center justify-center pb-24 lg:pt-32 md:pt-16 sm:pt-8 px-4 w-full flex-grow">
  <div className="flex flex-col gap-24 w-full">
  <div className="flex flex-col gap-12 w-full">
  <div className="flex flex-col gap-8 ">
  <h1 className="text-2xl sr-only md:not-sr-only sm:text-3xl self-center md:text-4xl lg:text-5xl">Stadnamnportalen</h1>
  
  <form className="grid grid-cols-5 md:grid-cols-7 items-center justify-center md:max-w-2xl md:mx-auto gap-3" action="view/search">
    <label htmlFor="search_input" className="sr-only">Søk i alle stedsnavn</label>
    <input id="search_input" className="col-span-4 rounded-sm h-12 border border-gray-400 text-base px-2" name="q" type="text"/>
    <IconButton className="btn btn-primary col-span-1 text-base h-full" type="submit" label="Søk"><PiMagnifyingGlass className="text-xl"/></IconButton>
    <Link href="/view/search" className="btn no-underline text-base col-span-5 md:col-span-2 whitespace-nowrap h-12 "><PiMapTrifold aria-hidden="true" className="mr-2"/>Utforsk kartet</Link>
  </form>
  

  { stats && <ul className="text-neutral-900 font-serif small-caps flex items-center justify-center flex-col lg:flex-row gap-6 lg:gap-12">
  <li className="flex flex-col items-center text-lg">
      Stadnamnoppslag
      <span className="text-4xl">{stats?.snidCount?.toLocaleString('nb-NO')}</span>
    </li>
    
    <li className="flex flex-col items-center text-lg">
      Datasett
      <span className="text-4xl">{stats?.datasetCount?.toLocaleString('nb-NO')}</span>
    </li>
    <li className="flex flex-col items-center text-lg">
      Oppslag i datasetta
      <span className="text-4xl">{stats?.datasetDocs?.toLocaleString('nb-NO')}</span>
    </li>
    
  </ul> }

  </div>

  </div>

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
  


  </div>
  <div className="flex flex-col items-center container gap-24">
  <section className="flex flex-col items-center gap-12" aria-labelledby="dataset_showcase">
    <h2 id="dataset_showcase" className="font-serif text-3xl">Nye datasett:</h2>
    <ul className="flex flex-col gap-6 xl:grid xl:grid-cols-2">
      {newest.map((card, index) => (
        <li key={index} className="card p-1 xl:col-span-1 items-start">
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
  <section className="flex flex-col items-center gap-12" aria-labelledby="dataset_showcase">
    <h2 id="dataset_showcase" className="font-serif text-3xl">Utvalde datasett</h2>
    <ul className="flex flex-col gap-6 xl:grid xl:grid-cols-2">
      {cards.map((card, index) => (
        <li key={index} className="card p-1 xl:col-span-1 items-start">
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
    <Link className="btn btn-outline text-xl flex gap-2 no-underline" href="/datasets"><PiMagnifyingGlass aria-hidden="true" className="text-2xl"/>Alle datasett</Link>
    </div>
  

</main>
      <Footer/>
      </>
  );
}
