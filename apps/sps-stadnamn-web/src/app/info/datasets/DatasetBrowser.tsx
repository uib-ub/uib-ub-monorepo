
'use client'
import { useState, useEffect} from 'react';
import { datasetPresentation, datasetTitles, datasetFeatures, featureNames, datasetTypes, typeNames, datasetDescriptions, datasetShortDescriptions } from '@/config/metadata-config'
import Image from 'next/image'
import { PiArchiveFill, PiArticleFill, PiBooksFill, PiCaretDown, PiCaretRight, PiCaretUp, PiCheck, PiCheckFat, PiCheckFatFill, PiDatabaseFill, PiEarFill, PiFileAudioFill, PiGavelFill, PiInfoFill, PiLinkSimpleFill, PiMapPinLineFill, PiMapTrifoldFill, PiWallFill } from 'react-icons/pi';
import { useQueryState } from 'nuqs';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DatasetBrowser({isMobile}: {isMobile: boolean}) {
  const searchParams = useSearchParams()
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [expandedOption, setExpandedOption] = useState<string | null>(null);

  const allFeatures = Object.keys(featureNames);
  const allTypes = Object.keys(typeNames);


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
    .filter(dataset => dataset != 'search')
    .filter(dataset =>
      selectedFilters.every(filter => 
        (datasetFeatures as {[key: string]: string[]})[dataset]?.includes(filter) || 
        (datasetTypes as {[key: string]: string[]})[dataset]?.includes(filter)
      )
    )
    .filter(dataset => datasetTitles[dataset].toLowerCase().includes(searchTerm.toLowerCase()) || datasetDescriptions[dataset]?.toLowerCase().includes(searchTerm.toLowerCase()))


  const datasetLink = (dataset: string) => {
    const newSearchParams = new URLSearchParams();
    const q = searchParams.get('q');
    if (dataset != 'search') {
      newSearchParams.set('dataset', dataset);
    }
    if (q) {
      newSearchParams.set('q', q);
    }
    return "search?" + newSearchParams.toString();
      
  }


  return (    
        <>
          <div className='flex flex-col col-span-1'>
          <div className='flex flex-col'>
          <input
              id='titleSearch'
              className='rounded-sm border border-gray-400 text-base px-2 py-1 h-8'
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
            />

          </div>
          
          <div className="flex gap-4 mt-2">
          <button className="flex items-center gap-1" onClick={() => setExpandedOption(prev => prev == 'type' ? null : 'type')} aria-controls="dataset-type" aria-expanded={expandedOption == 'type'}>
            {expandedOption == 'type' ? <PiCaretUp aria-hidden="true"/> : <PiCaretDown aria-hidden="true"/>}
            Datasettype</button>
          <button className="flex items-center gap-1" onClick={() => setExpandedOption(prev => prev == 'resources' ? null : 'resources')} aria-controls="dataset-resources" aria-expanded={expandedOption == 'resources'}>
            {expandedOption == 'resources' ? <PiCaretUp aria-hidden="true"/> : <PiCaretDown aria-hidden="true"/>}
            Ressurser</button>
          <div className="ml-auto xl:sr-only" role="status" aria-live="polite">{filteredDatasets.length} / {Object.keys(datasetPresentation).length -1}</div>
          </div>
          
            
            
            { expandedOption == 'type' && <ul id="dataset-type" className="flex flex-wrap xl:flex-col gap-x-4 mt-2 gap-y-2 justify-equal !list-none">
              {allTypes.map(type => {{
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
            </ul>}
    
            
            { expandedOption == 'resources' &&  <ul id="dataset-resources" className="flex flex-wrap xl:flex-col  gap-x-4 mt-2 gap-y-2 justify-equal !list-none">
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
            </ul>}
          </div>
          
          <div className='xl:col-span-3'>
            <h2 className='!text-neutral-800 font-semibold !text-base !mt-0 !p-0 xl:!h-8 !mb-2 items-center flex !font-sans sr-only xl:not-sr-only'>Treff: {filteredDatasets.length} / {Object.keys(datasetPresentation).length -1}</h2>
          
          <ul className="flex flex-col w-full divide-y !p-0 gap-2">
            {filteredDatasets.map((dataset) => (
          <li key={dataset} className={`h-full sm:my-0 !py-0 w-full grid grid-cols-6 relative ${searchParams.get('dataset') == dataset ? 'bg-accent-50' : ''}`}>
              <div className='flex flex-col col-span-2 xl:col-span-1 w-full pt-4'>
                <Image src={datasetPresentation[dataset].img} alt="Illustrasjon" aria-describedby={dataset + "_attribution"} width="512" height="512" className="object-cover w-full aspect-square sepia-[25%] grayscale-[50%]"/>
            
              <small id={dataset + "_attribution"} className="text-neutral-700 text-xs p-1 sr-only">{datasetPresentation[dataset].imageAttribution}</small>
              </div>
              
              <div className="p-2 px-4 md:p-4 col-span-4 xl:col-span-5 flex flex-col">
                <h3 className="md:text-lg font-semibold !mt-0 !pt-0">{datasetTitles[dataset]}</h3>
                <div className="text-sm space-y-4 break-words">
                <p>{isMobile ? datasetShortDescriptions[dataset] : datasetDescriptions[dataset]}</p>          
              </div>
              <div className="flex gap-2 mt-auto ml-auto pt-2">
                <Link href={ "/info/datasets/" + dataset }  className=" flex  items-center !pl-1 no-underline">
                  Les mer <PiCaretRight className="text-primary-600"/></Link>
              </div>
             
              </div>
              
          </li>
        ))}
      </ul>
      </div>    
      </>
  );
}