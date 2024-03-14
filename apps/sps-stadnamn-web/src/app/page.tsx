import UiBLogo from "@/components/svg/UiBLogo"
import { PiMapTrifold } from 'react-icons/pi';
import Link from 'next/link';
import { PiMagnifyingGlass } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import Image from 'next/image';
import { datasetTitles, datasetPresentation } from '@/config/dataset-config';
import Footer from '../components/layout/Footer';

export default function Home() {

  const cards = [ 'bsn', 'hord', 'rygh', 'leks'].map(code => {
    const info = datasetPresentation[code]
    return { img: info.img, alt: info.alt, imageAttribution: info.imageAttribution, title: datasetTitles[code], code: code, description: info.description, subindices: info.subindices, initPage: info.initPage }
  }
  )


  return (
    <>
<main className="flex flex-col grow-1 gap-48 items-center justify-center pb-8 lg:pt-32 md:pt-16 sm:pt-8  lg:pb-16 px-4 w-full flex-grow">
  <div className="flex flex-col gap-24 w-full">
  <div className="flex flex-col gap-12 w-full">
  <div className="flex flex-col gap-8 ">
  <h1 className="text-2xl sr-only md:not-sr-only sm:text-3xl self-center md:text-4xl lg:text-5xl">Stadnamnportalen</h1>
  
  <form className="grid grid-cols-5 md:grid-cols-7 items-center justify-center md:max-w-2xl md:mx-auto gap-3" action="view/search">
    <label htmlFor="search_input" className="sr-only">Søk i alle kilder</label>
    <input id="search_input" className="col-span-4 rounded-sm h-12 border border-gray-400 text-base px-2" name="q" type="text"/>
    <IconButton className="btn btn-primary col-span-1 text-base h-full" type="submit" label="Søk"><PiMagnifyingGlass aria-hidden='true' className="text-lg"/></IconButton>
    <Link href="/view/search" className="btn no-underline text-base col-span-5 md:col-span-2 whitespace-nowrap h-12 "><PiMapTrifold aria-hidden='true' className="mr-2"/>Utforsk kartet</Link>
  </form>
  
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
  <section className="flex flex-col items-center gap-12 container" aria-labelledby="dataset_showcase">
    <h2 id="dataset_showcase" className="font-serif text-3xl">Kildetilpasset søk</h2>
    <ul className="sm:grid sm:grid-cols-1 2xl:grid-cols-2 gap-6">
      {cards.map((card, index) => (
        <li key={index} className="card flex flex-col md:h-64 my-6 sm:my-0">
          <Link href={'view/' + card.code + (card.subindices?.length || card.initPage == 'info' ? '/info' : '')} className="flex flex-col sm:flex-row h-full w-full no-underline">
          <div className="w-full aspect-square sm:h-32 sm:w-32 sm:md:h-64 sm:md:w-64  lg:p-1 overflow-hidden sm:flex-none">
          <Image src={card.img} alt={card.alt || ''} width="512" height="512" className="object-cover w-full h-full sepia-[25%] grayscale-[50%]"/>
        </div>
          <div className="content p-4 pb-2 w-128 flex flex-col">
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p>{card.description}</p>
            {card.imageAttribution && 
            <small className="text-neutral-700 text-xs mt-auto">Illustrasjon: {card.imageAttribution}</small>
          }
          </div>
          </Link>
        </li>
      ))}
    </ul>
    <Link className="btn btn-outline text-xl flex gap-2 no-underline" href="/datasets"><PiMagnifyingGlass className="text-2xl"/>Flere søkevisninger</Link>
    </section>
  

</main>
      <Footer/>
      </>
  );
}
