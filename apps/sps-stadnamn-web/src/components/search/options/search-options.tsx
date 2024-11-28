
'use client'
import { useState} from 'react';
import { datasetPresentation, datasetTitles, datasetFeatures, featureNames, datasetTypes, typeNames, datasetDescriptions, datasetShortDescriptions } from '@/config/metadata-config'
import Image from 'next/image'
import { PiCaretDown, PiCaretRight, PiCaretUp, PiCheckFatFill } from 'react-icons/pi';
import { useQueryState } from 'nuqs';
import { useSearchParams } from 'next/navigation';
import { fieldConfig, searchableFields } from '@/config/search-config';
import Link from 'next/link';
import { useDataset } from '@/lib/search-params';


export default function SearchOptions({isMobile}: {isMobile: boolean}) {
  const searchParams = useSearchParams()
  const dataset = useDataset()
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [field, setField] = useQueryState('field')
  const allFeatures = Object.keys(featureNames);
  const allTypes = Object.keys(typeNames);
  const setExpandedKeyInfo = useState<string | null>(null)[1]

  



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
        <section className="flex flex-col mobile-padding" aria-labelledby="page_heading">
          { dataset && searchableFields[dataset].length > 0 ? <><h2 id="page_heading" className="text-xl text-neutral-900">Søkealternativer</h2>
          <div className="flex mb-4 mt-2 gap-4">
            <label className="flex gap-2">
              <input
                type="radio"
                checked={field == null}
                onChange={() => setField(null)}
              />
              Navn
            </label>
            {searchableFields[dataset].map(item => {
              return (
                <label key={item.key} className="flex gap-2">
                  <input
                      type="radio"
                      checked={item.key == field}
                      onChange={() => setField(item.key)}
                  />
                  {item.label}
                </label>
                
              )
            })}
            
          </div>
          

          <h3 className="text-xl font-semibold text-neutral-900 small-caps">Søkevisninger</h3>
          </>
          : <h2 id="page_heading" className="text-xl font-serif">Søkevisninger</h2>
          }
          <div className='flex flex-col mt-1 justify-between w-full'>
          <div className='flex flex-col'>
          <input
              id='titleSearch'
              className='rounded-sm border border-gray-400 text-base px-2 py-1'
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
          <div className="ml-auto" role="status" aria-live="polite">{filteredDatasets.length} / {Object.keys(datasetPresentation).length}</div>
          </div>
          
            
            
            { expandedOption == 'type' && <ul id="dataset-type" className="flex flex-wrap gap-x-4 mt-2 gap-y-2 justify-equal">
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
    
            
            { expandedOption == 'resources' &&  <ul id="dataset-resources" className="flex flex-wrap  gap-x-4 mt-2 gap-y-2 justify-equal">
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
          <div>
          
          <ul className="flex flex-col w-full divide-y mt-4">
            {filteredDatasets.map((dataset) => (
          <li key={dataset} className={`h-full sm:my-0 w-full grid grid-cols-4 relative ${searchParams.get('dataset') == dataset ? 'bg-accent-50' : ''}`}>
              <div className='flex flex-col sm:col-span-1 w-full my-4'>
                { dataset == 'search' ? 
                <Image src={datasetPresentation[dataset].img} alt="Illustrasjon" aria-describedby={dataset + "_attribution"} width="512" height="512" className="object-cover w-full aspect-square p-4 md:p-8 lg:p-12 bg-neutral-200"/>
              : <Image src={datasetPresentation[dataset].img} alt="Illustrasjon" aria-describedby={dataset + "_attribution"} width="512" height="512" className="object-cover w-full aspect-square sepia-[25%] grayscale-[50%]"/>
            }
              <small id={dataset + "_attribution"} className="text-neutral-700 text-xs p-1 sr-only">{datasetPresentation[dataset].imageAttribution}</small>
              </div>
              
              <div className="p-2 md:p-4 col-span-3 flex flex-col">
                <h3 className="md:text-lg font-semibold">{datasetTitles[dataset]}</h3>
                <div className="text-sm space-y-4 break-words">
                <p>{isMobile ? datasetShortDescriptions[dataset] : datasetDescriptions[dataset]}</p>          
              </div>
              <div className="flex gap-2 mt-auto pt-2">
                <Link href={dataset == 'search' ? '/info/search' : '/info/datasets/' + dataset }  className=" flex  items-center !pl-1 no-underline" onClick={() => setExpandedKeyInfo(prev => prev == dataset ? null : dataset)}>
                  
                  Les mer <PiCaretRight className="text-primary-600"/></Link>
                  {searchParams.get('dataset') == dataset || (dataset == 'search' && !searchParams.get('dataset')) ? <Link href={datasetLink(dataset)} className="ml-auto no-underline flex gap-2 text-accent-700" aria-current="page"><PiCheckFatFill/>Valgt</Link>
                  :
                <Link className="ml-auto" aria-current="false" href={datasetLink(dataset)}>Velg</Link>
                  }

              </div>
             
              </div>
              
          </li>
        ))}
      </ul>
      </div>    
      </section>
  );
}