import { Fragment, useContext, useEffect, useState} from 'react';
import { datasetTitles, datasetDescriptions, datasetShortDescriptions } from '@/config/metadata-config'
import { PiCaretRight, PiFunnel, PiFunnelFill, PiMagnifyingGlass } from 'react-icons/pi';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Clickable from '@/components/ui/clickable/clickable';
import { useDataset } from '@/lib/search-params';
import { GlobalContext } from '@/app/global-provider';
import ClickableIcon from '@/components/ui/clickable/clickable-icon';



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
    const no_subindices = Object.keys(datasetTitles).filter(d => !d.includes("_"))
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
          <label htmlFor="titleSearch" className="sr-only">Finn datasett</label>
          <input
              id='titleSearch'
              autoComplete="off"
              className='w-full border rounded-md border-neutral-300 p-1 px-2'
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
              .filter(d => d != 'search' || !isMobile)
              .map((itemDataset, index) => (
                <Fragment key={itemDataset}>
                  <li className="flex w-full">
                    { dataset == 'search' ?
                      <div className={`flex flex-col gap-6 p-4 w-full ${itemDataset == dataset ? 'bg-accent-50 border-l-4 border-accent-600' : ''}`}>
                        <div className="flex-1 gap-2">
                          {isMobile ? <h4 className="text-lg font-semibold text-neutral-900 mb-1">{datasetTitles[itemDataset]}</h4> : <h3 className="text-lg font-semibold text-neutral-900 mb-1">{datasetTitles[itemDataset]}</h3>}
                          <p className="text-neutral-700">{datasetShortDescriptions[itemDataset]}</p>      
                        </div>
                        {itemDataset == dataset ? 
                        <em className='text-neutral-700 ml-auto'>Gjeldande søkevisning</em>
                        : <div className="flex flex-col xl:flex-row gap-2">
                          <Clickable 
                            className="btn btn-outline xl:btn-compact flex items-center gap-2 text-base !pl-2" 
                            link 
                            only={{dataset: itemDataset, q: searchParams.get('q'), nav: 'datasets'}} 
                            label="Eiga søkevisning"
                          >
                            <PiMagnifyingGlass className="text-neutral-600 text-lg" aria-hidden="true"/>Søkevisning
                          </Clickable>

                          {itemDataset != 'all' && <Clickable 
                            className="btn btn-outline xl:btn-compact flex items-center gap-2 text-base !pl-2" 
                            link 
                            add={{datasets: itemDataset, nav: 'filters', facet: 'datasets'}} 
                          >
                            <PiFunnel className="text-neutral-600 text-lg" aria-hidden="true"/>
                            Bruk som filter

                          </Clickable>}
                        </div>}
                      </div>
                      :
                      <Clickable 
                        link 
                        only={{dataset: itemDataset, q: searchParams.get('q'), nav: 'datasets' }} 
                        className={`w-full h-full p-4  no-underline transition-colors duration-200 ${itemDataset == dataset ? 'bg-accent-50 border-l-4 border-accent-600' : 'hover:bg-neutral-50'}`}
                      >
                        {isMobile ? <h4 className="text-lg font-semibold text-neutral-900 mb-1">{datasetTitles[itemDataset]}</h4> : <h3 className="text-lg font-semibold text-neutral-900 mb-1">{datasetTitles[itemDataset]}</h3>}
                        <p className="text-neutral-700">{datasetShortDescriptions[itemDataset]}</p>      
                      </Clickable>
                    }
                  </li>
                </Fragment>
              ))}
          </ul>
      </div>
        </>
    
}