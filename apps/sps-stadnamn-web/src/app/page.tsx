import UiBLogo from "@/components/svg/UiBLogo"
import { PiMapTrifold, PiMapTrifoldFill } from 'react-icons/pi';
import { PiMagnifyingGlass } from 'react-icons/pi';
import Image from 'next/image';
import Link from 'next/link';
import { datasetTitles, datasetPresentation, publishDates, datasetShortDescriptions } from '@/config/metadata-config';
import Footer from '../components/layout/footer';
import Form from "next/form";
import React from 'react';
import HomeNavCards from "./home-nav-cards";
import { fetchStats } from "./api/_utils/stats";
import { userAgent } from "next/server";
import { headers } from "next/headers";

export default async function Home() {
  const { iiifStats, datasets, totalHits, groupCount } = await fetchStats()
  const headersList = await headers()
  const device = userAgent({headers: headersList}).device
  const isMobile = device.type === 'mobile'
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

  return (
    <>
<main 
  id="main" 
  tabIndex={-1} 
  className="flex flex-col grow-1 items-center justify-center   w-full flex-grow relative ">
  
  <div className={`bg-neutral-50/${isMobile ? '80' : '60'} w-full pt-4 md:pt-8 pb-24`}>
  <div className={`flex flex-col gap-3 relative z-20 px-4`}>
  <div className="flex flex-col w-full xl:w-auto gap-8 md:p-8 lg:py-8 self-center md:bg-neutral-50/90 md:rounded-xl xl:rounded-full xl:aspect-square my-0 md:my-16 xl:my-0 md:shadow-lg self align-middle justify-center">
  <div className="flex flex-col gap-8 md:px-8">
  <div className="flex flex-col gap-8">
    <div className="flex flex-col gap-6 xl:mt-32">
  <h1 className="self-center text-5xl text-neutral-900 sr-only md:not-sr-only !px-2 font-serif">Stadnamnsøk</h1>
  
  <Form className="flex items-center justify-center gap-2 w-full" action="search">
   
    <label htmlFor="search_input" className="sr-only">Søk i alle stedsnavn</label>
    <input 
      id="search_input" 
      className="flex-1 rounded-lg h-16 xl:h-12 border border-gray-300 text-lg xl:text-base px-4 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all" 
      name="q" 
      type="text"
    />
    <input type="hidden" name="nav" value="results"/>
    <button 
      className="bg-red-700 hover:bg-red-800 text-white rounded-lg h-16 xl:h-12 w-16 xl:w-12 flex items-center justify-center transition-colors duration-200 flex-shrink-0" 
      type="submit" 
      aria-label="Søk"
    >
      <PiMagnifyingGlass className="text-3xl xl:text-2xl"/>
    </button>
  </Form>
  </div>



  <div className="flex flex-col items-center gap-6">
  <div className="flex flex-col xl:flex-row items-end justify-center xl:gap-12 gap-6">
  <div className="flex flex-col items-center">
    <span className="uppercase tracking-widest text-neutral-900 xl:text-sm font-semibold mb-2">Oppslag i søket</span>
    <span className="xl:text-3xl text-4xl font-bold text-neutral-900" style={{ fontVariantNumeric: "tabular-nums" }}>
      {groupCount?.toLocaleString('nb-NO')}
    </span>
  </div>
  <div className="flex flex-col items-center">
    <span className="uppercase tracking-widest text-neutral-900 xl:text-sm font-semibold mb-2">Underoppslag</span>
    <span className="xl:text-3xl text-4xl font-bold text-neutral-900" style={{ fontVariantNumeric: "tabular-nums" }}>
      {totalHits?.toLocaleString('nb-NO')}
    </span>
  </div>
</div>
    <Link
      href="/search"
      className="bg-neutral-950/80 text-white no-underline xl:mb-16 mt-2 self-center w-full h-16 xl:h-auto xl:w-auto text-xl pr-12 pl-8 py-4 xl:py-2 xl:pr-8 xl:pl-6 rounded-lg xl:rounded-full flex items-center gap-3 transition-colors duration-200"
    >
      <PiMapTrifoldFill className="text-2xl" />
      Utforsk kartet
    </Link>
  </div>
  

  </div>
  </div>



</div>

  <HomeNavCards iiifStats={iiifStats} datasets={datasets}/>
    </div>
    </div>



<div className="flex items-center self-center justify-center flex-col lg:flex-row gap-12 relative z-20 bg-neutral-950/80 w-full py-16 text-white">
  <div className="flex flex-col md:flex-row items-center gap-6 text-white "><UiBLogo/><div className="flex flex-col gap-1 text-center md:text-left"><h2 className="tracking-widest font-serif uppercase">Universitetet i Bergen</h2><em className="font-serif">Universitetsbiblioteket</em></div>
  </div>
  <div className="flex flex-col md:flex-row gap-6 jusitfy-between text-center">
  <div className="flex flex-col"><span className="font-semibold">Språksamlingane</span>
  <Link href="https://spraksamlingane.no" className="text-sm">spraksamlingane.no</Link></div>
  <div className="flex flex-col"><span className="font-semibold">Digital utvikling</span>
  <Link href="https://uib.no/digitalutvikling" className="text-sm">uib.no/digitalutvikling</Link></div>

  </div>
  </div>
  <div className="flex flex-col items-center gap-24 relative z-20 px-4 py-24 bg-neutral-50/80 w-full">
  <section className="flex flex-col container gap-6" aria-labelledby="recently_added">
    <h2 id="recently_added" className="font-semibold font-serif text-3xl text-neutral-950 text-center">Sist lagt til</h2>
    <ul className="flex flex-col gap-6 xl:grid xl:grid-cols-2">
      {newest.map((card, index) => (
        <li key={index} className="bg-white shadow-lg p-4 xl:col-span-1 items-start rounded-lg">
          <Link className="no-underline group flex flex-col md:flex-row xl:flex-row" href={`search?indexDataset=${card.code}`}>
            <div className="overflow-hidden w-full md:h-[18rem] md:w-[18rem] shrink-0 aspect-square rounded-md">
              <div className={`h-full ${card.img.endsWith('.svg') ? 'bg-neutral-100' : ''}`}>
                <Image 
                  src={card.img} 
                  alt="Illustrasjon" 
                  aria-describedby={card.code + "_attribution"} 
                  height="512" 
                  width="512" 
                  className={`w-full h-full sepia-[25%] grayscale-[50%] border-2 border-neutral-200 rounded-md ${
                    card.img.endsWith('.svg') 
                      ? 'object-contain p-4' 
                      : 'object-cover'
                  }`}
                />
              </div>
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
  <section className="flex flex-col container gap-6" aria-labelledby="dataset_showcase">
    <h2 id="dataset_showcase" className="font-semibold font-serif text-3xl text-neutral-950 text-center">Utvalde datasett</h2>
    <ul className="flex flex-col gap-6 xl:grid xl:grid-cols-2">
      {cards.map((card, index) => (
        <li key={index} className="bg-white shadow-lg p-4 xl:col-span-1 items-start rounded-lg">
          <Link className="no-underline group flex flex-col md:flex-row xl:flex-row" href={`search?indexDataset=${card.code}`}>
            <div className="overflow-hidden w-full md:h-[18rem] md:w-[18rem] shrink-0 aspect-square rounded-md">
              <div className={`h-full ${card.img.endsWith('.svg') ? 'bg-neutral-100' : ''}`}>
                <Image 
                  src={card.img} 
                  alt="Illustrasjon" 
                  aria-describedby={card.code + "_attribution"} 
                  height="512" 
                  width="512" 
                  className={`w-full h-full sepia-[25%] grayscale-[50%] border-2 border-neutral-200 rounded-md ${
                    card.img.endsWith('.svg') 
                      ? 'object-contain p-4' 
                      : 'object-cover'
                  }`}
                />
              </div>
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
