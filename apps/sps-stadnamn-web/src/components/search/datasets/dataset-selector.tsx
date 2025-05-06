import { Fragment, useContext, useEffect, useState} from 'react';
import { datasetTitles, datasetDescriptions, datasetShortDescriptions } from '@/config/metadata-config'
import { PiCaretRight } from 'react-icons/pi';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Clickable from '@/components/ui/clickable/clickable';
import { useDataset } from '@/lib/search-params';
import { GlobalContext } from '@/app/global-provider';



export default function DatasetSelector() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredDatasets, setFilteredDatasets] = useState<string[]>([])
  const dataset = useDataset()
  const { isMobile } = useContext(GlobalContext)
  const [showAll, setShowAll] = useState(false)


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
          <label htmlFor="titleSearch" className="sr-only">Søk i datasett</label>
          <input
              id='titleSearch'
              autoComplete="off"
              className='rounded-sm border border-gray-400 text-base px-2 py-1'
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Link href="/info/datasets" className="ml-auto no-underline mt-1 flex items-center gap-1">Utforsk datasetta<PiCaretRight aria-hidden="true" className="text-primary-600 inline"/></Link>
        

          </div>
          </div>
          <div>
          
          <ul className="flex flex-col w-full divide-y mt-4">
            {filteredDatasets
              .filter((dataset, index) => showAll ? true : (index < 4 || filteredDatasets.length < 6))
              .map((dataset, index) => (
                <Fragment key={dataset}>
                  <li className="flex w-full ">
                    <Clickable link only={{dataset, q: searchParams.get('q'), nav: 'datasets' }} 
                                className="w-full h-full py-2 px-2 md:px-2 hover:bg-neutral-50 no-underline">
                      <strong className="font-semibold">{datasetTitles[dataset]}</strong>{" | "}
                      
                      {datasetShortDescriptions[dataset]}      
                    </Clickable>
                  </li>
                  {filteredDatasets.length > 5 && index === 3 && !showAll && (
                    <li className="w-full flex justify-center py-4">
                      <button onClick={() => setShowAll(true)} className="rounded-full bg-neutral-100 font-semibold px-8 py-2 no-underline">
                        Vis alle
                      </button>
                    </li>
                  )}
                  {index == filteredDatasets.length - 1 && showAll && (
                    <li className="w-full flex justify-center py-4">
                      <button onClick={() => setShowAll(false)} className="rounded-full bg-neutral-100 font-semibold px-8 py-2 no-underline">
                        Vis færre
                      </button>
                    </li>
                  )}

                </Fragment>
              ))}
          </ul>
      </div>
        </>
    
}