
'use client'
import { useEffect, useState} from 'react';
import { datasetTitles, datasetDescriptions, datasetShortDescriptions } from '@/config/metadata-config'
import { PiCaretRight } from 'react-icons/pi';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SearchLink from '@/components/ui/search-link';


export default function Datasets({isMobile}: {isMobile: boolean}) {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredDatasets, setFilteredDatasets] = useState<string[]>([])


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const titleMatch: string[] = []
    const contentMatch: string[] = []
    const no_subindices = Object.keys(datasetTitles).filter(dataset => !dataset.includes("_"))
    // Datasets match
    if (searchTerm?.length) {

      no_subindices.forEach(dataset => {
        if (datasetTitles[dataset].toLowerCase().includes(searchTerm.toLowerCase())) {
          titleMatch.push(dataset)
        }
        else if (datasetDescriptions[dataset]?.toLowerCase().includes(searchTerm.toLowerCase())) {
          contentMatch.push(dataset)
        }
      })

      setFilteredDatasets([...titleMatch, ...contentMatch])
    }
    else {
      setFilteredDatasets(no_subindices)
    }
  }
  , [searchTerm])






  return (    
        <section className="flex flex-col mobile-padding" aria-labelledby="page_heading">
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