
'use client'
import { datasetPresentation, datasetTitles } from '@/config/datasets'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '../Footer';

export default function Datasets() {
  return (
    <>
    <main className="flex flex-col grow-1 gap-48 items-center justify-center pb-8 lg:pt-32 md:pt-16 sm:pt-8  lg:pb-16 px-4 w-full flex-grow">
    <section className="flex flex-col items-center gap-12 container" aria-labelledby="dataset_showcase">
      <h1 id="dataset_showcase" className="text-2xl sr-only md:not-sr-only sm:text-3xl self-center text-neutral-900 md:text-4xl lg:text-5xl font-serif">Kilder</h1>
      <p>Velg filtre</p>
      
      <ul className="flex flex-col gap-6">
        {Object.keys(datasetPresentation).map((dataset) => (
          <li key={dataset} className="card flex flex-col sm:flex-row h-full my-6 sm:my-0 w-full sm:grid sm:grid-cols-4">
            
              <div className='flex flex-col sm:col-span-1'>
              <Image src={datasetPresentation[dataset].img} alt={datasetPresentation[dataset].alt || ''} width="512" height="512" className="object-cover aspect-square sepia-[25%] grayscale-[50%]"/>
              <small className="text-neutral-700 text-xs mt-auto">Illustrasjon: {datasetPresentation[dataset].imageAttribution}</small>
              </div>
              
              <div className="p-4 pb-2 flex flex-col sm:col-span-3">
                <h3 className="text-lg font-semibold">{datasetTitles[dataset]}</h3>
                <p>{datasetPresentation[dataset].description}</p>
                <Link href={'/search/' + dataset} className="no-underline">
                Søk i {datasetTitles[dataset]}
              </Link>
              </div>
              
          </li>
        ))}
      </ul>
    </section>
    </main>
    <Footer/>
    </>
  );
}