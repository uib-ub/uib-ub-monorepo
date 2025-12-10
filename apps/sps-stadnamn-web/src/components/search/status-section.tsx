'use client'
import { useMode } from '@/lib/param-hooks';
import { useSearchQuery } from '@/lib/search-params';
import useSearchData from '@/state/hooks/search-data';
import { GlobalContext } from '@/state/providers/global-provider';
import { useSearchParams } from 'next/navigation';
import { useContext } from 'react';
import { PiInfoFill, PiWarningFill } from 'react-icons/pi';
import ActiveFilters from './form/active-filters';
import SortSelector from './sort/sort-selector';

export default function StatusSection() {
  const { searchBounds, searchLoading, searchError, totalHits } = useSearchData()
  const mode = useMode()
  const { isMobile } = useContext(GlobalContext)
  const searchParams = useSearchParams()
  const doc = searchParams.get('doc')
  const group = searchParams.get('group')
  const datasetTag = searchParams.get('datasetTag')
  const { facetFilters, datasetFilters } = useSearchQuery()
  const fulltext = searchParams.get('fulltext')



  return <div className={`flex flex-col gap-2 ${mode == 'map' ? '' : 'px-2 pt-4 pb-2'}`}>
    <div className={`flex gap-1 items-start`}>


      <div className={`flex flex-wrap  xl:flex-row h-full gap-2`}>

        {false && !isMobile && <ActiveFilters />}</div>




    </div>
    {mode == 'list' && (!doc && !group) && datasetTag != 'base' && <div className="flex flex-wrap xl:flex-row h-full p-2 px-6 gap-1"><SortSelector /></div>}




    {mode == 'map' && (!searchLoading && !searchBounds?.length && !searchError && totalHits?.value > 0) &&
      <div
        role="status"
        aria-live="polite"
        className="bg-neutral-900 rounded-md h-12 px-4 text-white opacity-90 flex gap-2 items-center w-fit"
      >
        <PiInfoFill className="inline text-xl" /> Ingen treff med koordinater
      </div>
    }


    {(!searchLoading && !searchError && totalHits?.value == 0) ? <div role="status" aria-live="polite" className="bg-neutral-900 rounded-md h-12 px-4 text-white opacity-90 flex gap-2 items-center w-fit"><PiInfoFill className="inline text-xl" /> Ingen treff</div> : null}

    {searchError && <div role="status" aria-live="polite" className="bg-primary-700 rounded-md h-12 px-4 text-white opacity-90 flex gap-4 items-center w-fit">
      <PiWarningFill className="inline text-xl" />
      <span>Kunne ikkje hente søkeresultat</span>
    </div>
    }
    {!searchBounds && !searchError && !searchLoading && totalHits > 0 && mode == 'map' && <div role="status" aria-live="polite" className="bg-primary-700 h-12 px-4 rounded-md text-white opacity-90 flex gap-4 items-center w-fit">
      <PiWarningFill className="inline text-xl" />
      <span>Kunne ikkje hente koordinater</span>
    </div>}


  </div>
}

