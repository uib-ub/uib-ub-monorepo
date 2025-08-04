import UiBLogo from "@/components/svg/UiBLogo"
import { PiArchive, PiBookOpenThin, PiDatabase, PiTag } from 'react-icons/pi';
import { PiMagnifyingGlass } from 'react-icons/pi';
import Image from 'next/image';
import Link from 'next/link';
import { datasetTitles, datasetPresentation, publishDates, datasetShortDescriptions } from '@/config/metadata-config';
import Footer from '../components/layout/footer';
import { fetchStats } from '@/app/api/_utils/actions';
import Form from "next/form";
import React from 'react';
import { fetchIIIFStats } from "./api/iiif/iiif-stats";

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
  const iiifStats = await fetchIIIFStats()

  // Define your nav cards at the top of your component
  const navCards = [
    {
      href: "/search",
      icon: <PiBookOpenThin aria-hidden="true" />,
      stat: stats?.datasetDocs?.toLocaleString('nb-NO'),
      title: "Stadnamnsøk",
      description: "Søk i alle kjeldeoppslaga i stadnamnportalen",
    },

    {
      href: "/info/datasets",
      icon: <PiDatabase aria-hidden="true"/>,
      stat: stats?.datasetCount?.toLocaleString('nb-NO'),
      title: "Datasett",
      description: "Få oversikt over kjeldegrunnlaget i Stadnamnportalen",
    },
    {
      href: "/iiif",
      icon: <PiArchive aria-hidden="true"/>,
      stat: (iiifStats?.images + iiifStats?.audio).toLocaleString('nb-NO'),
      title: "Arkiv",
      description: "Hierarkisk utforsker for arkivressurser som faksimiler og lydopptak",
    },
    
    /*
    
    {
      href: "/info/datasets",
      icon: <PiWallThin aria-hidden="true" />,
      stat: stats?.datasetCount?.toLocaleString('nb-NO'),
      title: "Grunnord",
      description: "Beskrivelse her",
    },
   
    
    {
      href: "/info/datasets",
      icon: <PiMapPinThin aria-hidden="true" />,
      stat: stats?.datasetCount?.toLocaleString('nb-NO'),
      title: "Lokaliteter",
      description: "Stadsdata frå Kartverket, geonames m. m.",
    },
    */
    
    
  ];

  return (
    <>
<main id="main" tabIndex={-1} className="flex flex-col grow-1 gap-24 items-center justify-center pb-24 pt-4 md:pt-8 px-4 w-full flex-grow carta-marina bg-neutral-100 md:bg-transparent">
  <div className="flex flex-col gap-3">
  <div className="flex flex-col w-full xl:w-auto gap-12 md:p-8 lg:py-8 w-fit self-center md:bg-white md:rounded-xl xl:rounded-full xl:aspect-square my-0 md:my-16 xl:my-0 md:bg-opacity-75 md:shadow-lg self align-middle justify-center">
  <div className="flex flex-col gap-8 md:px-8">
  <div className="flex flex-col gap-8">
    <div className="flex flex-col gap-6">
  <h1 className="self-center text-5xl text-neutral-900 sr-only md:not-sr-only !px-2">Stadnamnportalen</h1>
  
  <Form className="grid grid-cols-4 md:grid-cols-6 items-center justify-center gap-3" action="search">
   
    <label htmlFor="search_input" className="sr-only">Søk i alle stedsnavn</label>
    <input id="search_input" className="col-span-3 md:col-span-5 rounded-md h-12 border border-gray-400 text-base px-2" name="q" type="text"/>
    <input type="hidden" name="nav" value="results"/>
    <button className="btn btn-primary col-span-1 text-base h-full" type="submit" aria-label="Søk"><PiMagnifyingGlass className="text-xl"/></button>
  </Form>
  </div>


  { false && stats && <ul className="text-neutral-900 font-serif small-caps flex items-center justify-center flex-col sm:flex-row gap-4 lg:gap-6">
  <li className="flex flex-col items-center text-base">
      Stadnamnoppslag
      <span className="text-2xl">{stats?.snidCount?.toLocaleString('nb-NO')}</span>
    </li>
    
    <li className="flex flex-col items-center text-base">
      Datasett
      <span className="text-2xl">{stats?.datasetCount?.toLocaleString('nb-NO')}</span>
    </li>
    <li className="flex flex-col items-center text-base">
      
      <span className="text-2xl">{stats?.datasetDocs?.toLocaleString('nb-NO')}</span>
    </li>
    
  </ul> }
  

  </div>
  </div>



</div>


    <nav className="w-full flex flex-col items-center mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        {navCards.map((card, idx) => (
          <Link
            key={card.title + idx}
            href={card.href}
            className="flex flex-row shadow-md bg-white opacity-90 rounded-lg p-3 gap-3 no-underline transition hover:shadow-lg max-w-md w-full mx-auto"
          >
            {false &&<div className="flex items-center justify-center bg-neutral-50 border-neutral-200 border rounded-md p-3">
              {React.cloneElement(card.icon, { className: "text-8xl text-primary-600" })}
            </div>}
            <div className="flex flex-col justify-between flex-1 min-w-0 items-center">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl text-neutral-800 font-serif mb-1 flex items-center gap-2">
                  {card.title}
                </h2>
                {card.description && (
                  <div className="text-neutral-800 font-normal text-center">
                    {card.description}
                  </div>
                )}
              </div>
              {card.stat && (
                <span className="flex flex-row items-center gap-2 text-neutral-900 text-2xl font-serif rounded-full mt-2" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {false && React.cloneElement(card.icon, { className: "text-xl text-primary-600" })} {card.stat}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </nav>
    </div>



<div className="flex items-center self-center justify-center flex-col lg:flex-row gap-12">
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
    <h2 id="recently_added" className="font-serif text-3xl text-neutral-900 text-center">Sist lagt til</h2>
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
  <section className="flex flex-col gap-6" aria-labelledby="dataset_showcase">
    <h2 id="dataset_showcase" className="font-serif text-3xl text-neutral-900 text-center">Utvalde datasett</h2>
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
