'use client'
import { useState } from 'react';
import { datasetPresentation, datasetTitles, datasetFeatures, featureNames, datasetTypes, typeNames } from '@/config/client-config'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '../Footer';
import { PiArchiveFill, PiArticleFill, PiBooksFill, PiDatabaseFill, PiEarFill, PiFileAudioFill, PiGavelFill, PiLinkSimpleFill, PiMapPinLineFill, PiMapTrifoldFill, PiWallFill } from 'react-icons/pi';

export default function Datasets() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const allFeatures = Object.keys(featureNames);
  const allTypes = Object.keys(typeNames);

  
  const icons: {[key: string]: JSX.Element} ={
    "image": <PiArticleFill/>,
    "audio": <PiFileAudioFill />,
    "phonetic": <PiEarFill />,
    "coordinates": <PiMapPinLineFill />,
    "link": <PiLinkSimpleFill />,
    "maps": <PiMapTrifoldFill />,
    "base": <PiWallFill />,

    "collection": <PiArchiveFill />,
    "encyclopedia": <PiBooksFill />,
    "database": <PiDatabaseFill />,
    "public": <PiGavelFill />,
    
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilters(prevFilters =>
      prevFilters.includes(filter)
        ? prevFilters.filter(f => f !== filter)
        : [...prevFilters, filter]
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredDatasets = Object.keys(datasetPresentation)
    .filter(dataset =>
      selectedFilters.every(filter => 
        (datasetFeatures as {[key: string]: string[]})[dataset]?.includes(filter) || 
        (datasetTypes as {[key: string]: string[]})[dataset]?.includes(filter)
      )
    )
    .filter(dataset => datasetTitles[dataset].toLowerCase().includes(searchTerm.toLowerCase()));


  return (
    <>
      <main className="flex flex-col grow-1 gap-48 items-center pb-8 lg:pt-32 md:pt-16 sm:pt-8  lg:pb-16 px-4 w-full flex-grow">
        <section className="flex flex-col items-center gap-12 container" aria-labelledby="dataset_showcase">
          <h1 id="dataset_showcase" className="text-2xl sm:text-3xl self-center text-neutral-900 md:text-4xl lg:text-5xl font-serif">Finn kilde</h1>
          <div className='flex flex-col lg:grid lg:grid-cols-3 justify-between gap-12 w-full'>
          <div className='flex flex-col md gap-4'>
          <h2 className='text-xl'>Tittel</h2>
          <input
              className='rounded-sm border border-gray-400 text-base px-2 py-1'
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
            />

          </div>
          <div className='space-y-4'>
            <h2 className='text-xl'>Datasettype</h2>
            
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 justify-between">
              {allTypes.map(type => {{
                const resultCount = filteredDatasets.filter(dataset => (datasetTypes as {[key: string]: string[]})[dataset]?.includes(type)).length;
                if (resultCount > 0) {
                return (
                    <li key={type} className='col-span-1 space-x-1'>
                    <input
                        type="checkbox"
                        id={type}
                        checked={selectedFilters.includes(type)}
                        onChange={() => handleFilterChange(type)}
                    />
                    <label htmlFor={type}>{(typeNames as {[key: string]: string})[type]} <span className='rounded-sm p-0 px-1 bg-neutral-600 text-white text-xs'>{resultCount}</span></label>
                    </li>
                );
                }
                }}
                )}
            </ul>
          </div>
          <div className='space-y-4'>
            <h2 className='text-xl'>Ressurser</h2>
            
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 justify-between">
              {allFeatures.map(feature => {{
                const resultCount = filteredDatasets.filter(dataset => (datasetFeatures as {[key: string]: string[]})[dataset]?.includes(feature)).length;
                if (resultCount > 0) {
                return (
                    <li key={feature} className='col-span-1 space-x-1'>
                    <input
                        type="checkbox"
                        id={feature}
                        checked={selectedFilters.includes(feature)}
                        onChange={() => handleFilterChange(feature)}
                    />
                    <label htmlFor={feature}>{(featureNames as {[key: string]: string})[feature]} <span className='rounded-sm p-0 px-1 bg-neutral-600 text-white text-xs'>{resultCount}</span></label>
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
              <small className="text-neutral-700 text-xs p-1">{datasetPresentation[dataset].alt} | {datasetPresentation[dataset].imageAttribution}</small>
              </div>
              
              <div className="p-4 pb-2 flex flex-col sm:col-span-3">
                <h3 className="text-2xl font-semibold">{datasetTitles[dataset]}</h3>
                <ul className='flex gap-2 my-2 text-neutral-900'>
                {datasetTypes[dataset].map((type) => (
                    <div key={type} className="flex items-center gap-1">
                    {icons[type]}
                    <span>{typeNames[type]}</span>
                    </div>
                ))}
                </ul>
                <div className="space-y-4">
                <p>{datasetPresentation[dataset].description}</p>
                <div className="space-y-2">
                <h4 className='font-semibold'>Ressurser</h4>
                <ul className='flex gap-2 text-neutral-900'>
                {datasetFeatures[dataset].map((feature) => (
                    <div key={feature} className="flex items-center gap-1">
                    {icons[feature]}
                    <span>{featureNames[feature]}</span>
                    </div>
                ))}
                </ul>
                </div>
                <div className='mt-10 flex gap-2 flex-wrap'>
                <Link href={'/search/' + dataset + (datasetPresentation[dataset].initPage ? `?view=${datasetPresentation[dataset].initPage}` : '')} className="no-underline btn btn-outline">
                Utforsk {datasetTitles[dataset]}
              </Link>
              {Object.keys(datasetPresentation[dataset].subindices || {}).map((subindexKey) => {
                const subindexConfig = datasetPresentation[dataset].subindices?.[subindexKey] 
                const initPage = subindexConfig?.initPage || datasetPresentation[dataset].initPage
                
                
                return (
                <Link 
                  key={subindexKey} 
                  href={'/search/' + subindexKey + (initPage ? '?view=' + initPage : '')} 
                  className="no-underline btn btn-outline"
                >
                  Søkevisning for {datasetTitles[subindexKey]}
                </Link>
              )})}
              </div>
              </div>
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