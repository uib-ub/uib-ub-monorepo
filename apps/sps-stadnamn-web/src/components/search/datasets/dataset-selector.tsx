import { useEffect, useState} from 'react';
import { datasetTitles, datasetDescriptions, datasetShortDescriptions } from '@/config/metadata-config'
import { PiCaretRight } from 'react-icons/pi';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SearchLink from '@/components/ui/search-link';
import { useDataset } from '@/lib/search-params';



export default function DatasetSelector() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredDatasets, setFilteredDatasets] = useState<string[]>([])
  const dataset = useDataset()


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const titleMatch: string[] = []
    const contentMatch: string[] = []
    const no_subindices = Object.keys(datasetTitles).filter(d => !d.includes("_") && d != dataset)
    // Datasets match
    if (searchTerm?.length) {

      no_subindices.forEach(d => {
        if (datasetTitles[d].toLowerCase().includes(searchTerm.toLowerCase())) {
          titleMatch.push(d)
        }
        else if (datasetDescriptions[d]?.toLowerCase().includes(searchTerm.toLowerCase())) {
          contentMatch.push(d)
        }
      })

      setFilteredDatasets([...titleMatch, ...contentMatch])
    }
    else {
      setFilteredDatasets(no_subindices)
    }
  }
  , [searchTerm, dataset])

    return <>
        <div className='flex flex-col justify-between w-full px-2'>
          <div className='flex flex-col'>
          <input
              id='titleSearch'
              className='rounded-sm border border-gray-400 text-base px-2 py-1'
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Link href="/info/datasets" className="ml-auto no-underline mt-1 flex items-center gap-1">Utforsk datasettene<PiCaretRight aria-hidden="true" className="text-primary-600 inline"/></Link>
        

          </div>
          </div>
          <div>
          
          <ul className="flex flex-col w-full divide-y mt-4">
            {filteredDatasets.map((dataset) => (
          <li key={dataset} className="flex w-full ">

              
              <SearchLink only={{dataset, q: searchParams.get('q'), nav: 'datasets' }} 
                          className="w-full h-full py-2 px-2 md:px-2 hover:bg-neutral-50 no-underline">
                <strong className="font-semibold">{datasetTitles[dataset]}</strong>{" | "}
                
                {datasetShortDescriptions[dataset]}      
              </SearchLink>

              
              
          </li>
        ))}
      </ul>
      </div>
        </>
    
}