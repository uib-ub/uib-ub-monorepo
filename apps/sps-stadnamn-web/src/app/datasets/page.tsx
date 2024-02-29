'use client'
import { useState } from 'react';
import { datasetPresentation, datasetTitles, datasetFeatures, featureNames } from '@/config/client-config'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '../Footer';

export default function Datasets() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const allFeatures = Object.keys(featureNames);

  const handleFilterChange = (feature: string) => {
    setSelectedFilters(prevFilters =>
      prevFilters.includes(feature)
        ? prevFilters.filter(f => f !== feature)
        : [...prevFilters, feature]
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredDatasets = Object.keys(datasetPresentation)
    .filter(dataset =>
      selectedFilters.every(filter => (datasetFeatures as {[key: string]: string[]})[dataset]?.includes(filter))
    )
    .filter(dataset => datasetTitles[dataset].toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <main className="flex flex-col grow-1 gap-48 items-center pb-8 lg:pt-32 md:pt-16 sm:pt-8  lg:pb-16 px-4 w-full flex-grow">
        <section className="flex flex-col items-center gap-12 container" aria-labelledby="dataset_showcase">
          <h1 id="dataset_showcase" className="text-2xl sr-only md:not-sr-only sm:text-3xl self-center text-neutral-900 md:text-4xl lg:text-5xl font-serif">Kilder</h1>
          <div className='flex flex-col lg:grid lg:grid-cols-3 justify-between gap-12 w-full'>
          <div className='flex flex-col md gap-4'>
          <h2 className='text-xl'>Filtrer på tittel</h2>
          <input
              className='rounded-sm border border-gray-400 text-base px-2 py-1'
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
            />

          </div>
          <div className='flex flex-col gap-4'>
            <h2 className='text-xl'>Filtrer på ressurser</h2>
            
            <ul className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-2 justify-between">
              {allFeatures.map(feature => {{
                const featureCount = filteredDatasets.filter(dataset => (datasetFeatures as {[key: string]: string[]})[dataset]?.includes(feature)).length;
                if (featureCount > 0) {
                return (
                    <li key={feature} className='col-span-1'>
                    <input
                        type="checkbox"
                        id={feature}
                        checked={selectedFilters.includes(feature)}
                        onChange={() => handleFilterChange(feature)}
                    />
                    <label htmlFor={feature}>{(featureNames as {[key: string]: string})[feature]} ({featureCount})</label>
                    </li>
                );
                }
                }}
                )}
            </ul>
          </div>
          </div>

          <ul className="flex flex-col gap-6">
            {filteredDatasets.map((dataset) => (
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