
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
import SearchLink from '@/components/ui/search-link';


export default function Datasets({isMobile}: {isMobile: boolean}) {
  const searchParams = useSearchParams()
  const dataset = useDataset()
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [field, setField] = useQueryState('field')



  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredDatasets = Object.keys(datasetPresentation)
    .filter(dataset => datasetTitles[dataset].toLowerCase().includes(searchTerm.toLowerCase()) || datasetDescriptions[dataset]?.toLowerCase().includes(searchTerm.toLowerCase()))
  



  return (    
        <section className="flex flex-col mobile-padding" aria-labelledby="page_heading">
          { false && dataset && searchableFields[dataset].length > 0 && <><h2 id="page_heading" className="text-xl text-neutral-900 px-4">Søkealternativer</h2>
          <div className="flex mb-4 mt-2 gap-4 px-4">
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
          

          <h3 className="text-xl font-semibold text-neutral-900 small-caps px-4">Søkevisninger</h3>
          </>
          }
          <h2 id="page_heading" className="text-xl font-serif px-4">Datasett</h2>
          <div className='flex flex-col mt-1 justify-between w-full px-4'>
          <div className='flex flex-col'>
          <input
              id='titleSearch'
              className='rounded-sm border border-gray-400 text-base px-2 py-1'
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Link href="/info/datasets" className="ml-auto no-underline">Utforsk datasettene <PiCaretRight aria-hidden="true" className="text-primary-600 inline"/></Link>
        

          </div>

          
            
            
            
   
          </div>
          <div>
          
          <ul className="flex flex-col w-full divide-y mt-4">
            {filteredDatasets.map((dataset) => (
          <li key={dataset} className="flex w-full ">

              
              <SearchLink only={{dataset, q: searchTerm, expanded: isMobile ? 'info': 'datasets' }} 
                          className="w-full h-full py-2 px-2 md:px-4 hover:bg-neutral-50 no-underline aria-[current='page']:bg-accent-200"
                          aria-current={searchParams.get('dataset') == dataset ? 'page' : undefined}>
                <div className="font-semibold">{datasetTitles[dataset]}</div>
                
                {datasetShortDescriptions[dataset]}      
              </SearchLink>

              
              
          </li>
        ))}
      </ul>
      </div>    
      </section>
  );
}