'use client'
import { useState, useEffect} from 'react';
import { datasetPresentation, datasetTitles, datasetFeatures, featureNames, datasetTypes, typeNames, datasetDescriptions } from '@/config/metadata-config'
import Image from 'next/image'
import Link from 'next/link'
import { PiArchiveFill, PiArticleFill, PiBooksFill, PiDatabaseFill, PiEarFill, PiFileAudioFill, PiGavelFill, PiLinkSimpleFill, PiMapPinLineFill, PiMapTrifoldFill, PiWallFill } from 'react-icons/pi';
import { contentSettings } from '@/config/server-config';


export default function DatasetBrowser() {

  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [stats, setStats] = useState<any>(null);

  const allFeatures = Object.keys(featureNames);
  const allTypes = Object.keys(typeNames);

  
  const icons: {[key: string]: JSX.Element} ={
    "image": <PiArticleFill aria-hidden="true"/>,
    "audio": <PiFileAudioFill aria-hidden="true"/>,
    "phonetic": <PiEarFill aria-hidden="true"/>,
    "coordinates": <PiMapPinLineFill aria-hidden="true"/>,
    "link": <PiLinkSimpleFill aria-hidden="true"/>,
    "maps": <PiMapTrifoldFill aria-hidden="true"/>,
    "base": <PiWallFill aria-hidden="true"/>,
    "sprak": <PiArchiveFill aria-hidden="true"/>,
    "encyclopedia": <PiBooksFill aria-hidden="true"/>,
    "database": <PiDatabaseFill aria-hidden="true"/>,
    "public": <PiGavelFill aria-hidden="true"/>

  };

  useEffect(() => {
    fetch('/api/stats').then(response => response.json()).then(data => {
      setStats(data)
    }).catch(() =>
      setStats(null))}
  , [])



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
      dataset != 'search' &&
      selectedFilters.every(filter => 
        (datasetFeatures as {[key: string]: string[]})[dataset]?.includes(filter) || 
        (datasetTypes as {[key: string]: string[]})[dataset]?.includes(filter)
      )
    )
    .filter(dataset => datasetTitles[dataset].toLowerCase().includes(searchTerm.toLowerCase()));


  return (    
        <section className="flex flex-col items-center gap-12 container" aria-labelledby="page_heading">
          <h1 id="page_heading" className="text-2xl sm:text-3xl self-center text-neutral-900 md:text-4xl lg:text-5xl font-serif">Datasett</h1>
          <div className='flex flex-col lg:grid lg:grid-cols-3 justify-between gap-12 w-full'>
          <div className='flex flex-col md gap-4'>
          <h2 className='text-xl'><label htmlFor="titleSearch">Tittel</label></h2>
          <input
              id='titleSearch'
              className='rounded-sm border border-gray-400 text-base px-2 py-1'
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
            />

          </div>
          <div className='space-y-4'>
            <h2 className='text-xl'>Datasettype</h2>
             
            
            <ul className="flex flex-wrap flex-col md:flex-row lg:flex-col xl:flex-row gap-x-6 gap-y-2 justify-equal">
              { allTypes.map(type => {{
                const resultCount = filteredDatasets.filter(dataset => (datasetTypes as {[key: string]: string[]})[dataset]?.includes(type)).length;
                if (resultCount > 0) {
                return (
                    <li key={type} className='space-x-1'>
                    <input
                        type="checkbox"
                        id={type}
                        checked={selectedFilters.includes(type)}
                        onChange={() => handleFilterChange(type)}
                    />
                    <label htmlFor={type}>{(typeNames as {[key: string]: string})[type]} <span className='rounded-sm p-0 px-1 bg-neutral-800 text-white text-xs'>{resultCount}</span></label>
                    </li>
                );
                }
                }}
                )}
            </ul>
          </div>
          <div className='space-y-4'>
            <h2 className='text-xl'>Ressurser</h2>
            <ul className="flex flex-wrap flex-col md:flex-row lg:flex-col xl:flex-row gap-x-6 gap-y-2 justify-equal">
              {allFeatures.map(feature => {{
                const resultCount = filteredDatasets.filter(dataset => (datasetFeatures as {[key: string]: string[]})[dataset]?.includes(feature)).length;
                if (resultCount > 0) {
                return (
                    <li key={feature} className='space-x-1'>
                    <input
                        type="checkbox"
                        id={feature}
                        checked={selectedFilters.includes(feature)}
                        onChange={() => handleFilterChange(feature)}
                    />
                    <label htmlFor={feature}>{(featureNames as {[key: string]: string})[feature]} <span className='rounded-sm p-0 px-1 bg-neutral-800 text-white text-xs'>{resultCount}</span></label>
                    </li>
                );
                }
                }}
                )}
            </ul>
          </div>
          </div>
          <div>
          <div className="text-xl self-start mb-3" role="status" aria-live="polite">{filteredDatasets.length} av {Object.keys(datasetPresentation).length} datasett</div>
          <ul className="flex flex-col gap-y-6 w-full">
            { filteredDatasets.map((dataset) => (
          <li key={dataset} className="card flex flex-col sm:flex-row h-full my-6 sm:my-0 w-full sm:grid sm:grid-cols-4 relative">
              <div className='flex flex-col sm:col-span-1 w-full'>
              <Image src={datasetPresentation[dataset].img} alt="Illustrasjon" aria-describedby={dataset + "_attribution"} width="512" height="512" className="object-cover w-full aspect-square sepia-[25%] grayscale-[50%]"/>
              <small id={dataset + "_attribution"} className="text-neutral-700 text-xs p-1">{datasetPresentation[dataset].imageAttribution}</small>
              </div>
              
              <div className="p-4 pb-2 sm:col-span-3">
                <span className="flex flex-wrap"><h3 className="text-xl sm:text-2xl font-semibold">{datasetTitles[dataset]}</h3>
                {stats?.datasets?.[dataset] && <div className="text-lg ml-auto text-neutral-700 font-serif !flex">
                  <div>{stats.datasets[dataset].doc_count.toLocaleString('nb-NO')} oppslag
                  </div>             
                  </div>}
                </span>
                <ul className='flex flex-wrap gap-2 my-2 text-neutral-900'>
                {datasetTypes[dataset]?.map((type) => (
                    <li key={type} className="flex items-center gap-1">
                    {icons[type]}
                    <span>{typeNames[type]}</span>
                    </li>
                ))}
                </ul>
                <div className="space-y-4 break-words">
                <p>{datasetDescriptions[dataset]}</p>
                <div>© {datasetPresentation[dataset].attribution}. Lisens: <Link href={datasetPresentation[dataset].license.url}>
                  {datasetPresentation[dataset].license.name}
                </Link></div>
                {datasetPresentation[dataset].links?.map((link) => (
                  <div key={link.href}>{link.title}<Link className="break-all" href={link.href}>{link.text || link.href}</Link></div>
                ))}

                <div className="space-y-2">
                <h4 className='font-semibold'>Ressurser</h4>
                <ul className='flex flex-wrap gap-2 text-neutral-900'>
                {datasetFeatures[dataset]?.map((feature) => (
                    <li key={feature} className="flex items-center gap-1">
                    {icons[feature]}
                    <span>{featureNames[feature]}</span>
                    </li>
                ))}
                </ul>
                </div>
                <div className='mt-10 flex gap-2 flex-wrap'>
                <Link href={'/view/' + dataset + (datasetPresentation[dataset].initPage ? `/${datasetPresentation[dataset].initPage}` : '')} className="no-underline btn btn-outline">
                Søk i {datasetTitles[dataset]}
              </Link>
              {Object.keys(datasetPresentation[dataset].subindices || {}).map((subindexKey) => {
                const subindexConfig = datasetPresentation[dataset].subindices?.[subindexKey] 
                const initPage = subindexConfig?.initPage || datasetPresentation[dataset].initPage
                
                
                return (
                <Link 
                  key={subindexKey} 
                  href={'/view/' + subindexKey + (initPage ? `/${initPage}?display=${contentSettings[subindexKey].display}` : '')} 
                  className="no-underline btn btn-outline"
                >
                  Søk i {datasetTitles[subindexKey]}
                </Link>
              )})}
              </div>
              </div>
             
              </div>
              
          </li>
        ))}
      </ul>
      </div>
    </section>
  );
}