'use client'
import { useContext } from 'react';
import ActiveFilters from './form/active-filters';
import { PiFunnel, PiInfoFill, PiSlidersHorizontal, PiWarningFill } from 'react-icons/pi';
import ModeSelector from '../tabs/mode-selector';
import { GlobalContext } from '@/app/global-provider';
import SortSelector from './sort/sort-selector'
import { useMode } from '@/lib/param-hooks';
import { useSearchParams } from 'next/navigation';
import useSearchData from '@/state/hooks/search-data';
import Clickable from '../ui/clickable/clickable';
import { useSearchQuery } from '@/lib/search-params';
import Badge from '../ui/badge';
import { formatNumber } from '@/lib/utils';
import { useSessionStore } from '@/state/zustand/session-store';

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
    const filterCount = facetFilters.length + datasetFilters.length + (fulltext ? 1 : 0)
    const snappedPosition = useSessionStore((s) => s.snappedPosition)
    const drawerContent = useSessionStore((s) => s.drawerContent)
    const setDrawerContent = useSessionStore((s) => s.setDrawerContent)


    return <div className={`flex flex-col gap-2`}> 
    <div className={`flex gap-1 items-start`}>
    
    
    <div className={`flex flex-wrap  xl:flex-row h-full gap-2`}>
    {(mode != 'map' || snappedPosition < 60) && datasetTag != 'tree' && <Clickable onClick={() => setDrawerContent('filters')} add={{nav: 'filters'}} aria-label="Filter" className={`flex items-center justify-center ${drawerContent == 'filters' ? 'bg-accent-800 text-white' : 'bg-white'} relative xl:h-10 xl:w-10 p-3 xl:p-0 gap-2 text-neutral-800 shadow-lg rounded-full`}>
                <PiSlidersHorizontal className="text-2xl" aria-hidden="true"/>
                {isMobile  && filterCount > 0 && <span className={`results-badge bg-primary-500 absolute bottom-0 -right-1 -ml-2 rounded-full text-white text-xs ${filterCount < 10 ? 'px-1.5' : 'px-1'}`}>
                            {formatNumber(filterCount)}
                        </span>}
    </Clickable>}
      
      {!isMobile && <ActiveFilters/> }</div>




    </div>
    {mode == 'list' && (!doc && !group) && datasetTag != 'base' && <div className="flex flex-wrap xl:flex-row h-full p-2 px-6 gap-1"><SortSelector/></div>}
    
    


    {mode == 'map' && (!searchLoading && !searchBounds?.length && !searchError && totalHits?.value > 0) && 
      <div role="status" 
           aria-live="polite" 
           className="bg-neutral-900 rounded-md p-4 text-white opacity-90 flex gap-2 items-center w-fit">
            <PiInfoFill className="inline text-xl"/> Ingen treff med koordinatar
      </div>
    }


    { ( !searchLoading && !searchError && totalHits?.value == 0) ? <div role="status" aria-live="polite" className="bg-neutral-900 rounded-md p-4 text-white opacity-90 flex gap-2 items-center w-fit"><PiInfoFill className="inline text-xl"/> Ingen treff</div> : null}
    
    { searchError && <div role="status" aria-live="polite" className="bg-primary-700 rounded-md p-4 text-white opacity-90 flex gap-4 items-center w-fit">
        <PiWarningFill className="inline text-xl"/> 
        <span>Kunne ikkje hente søkeresultat</span>
      </div>
    }
    { !searchBounds && !searchError && !searchLoading && totalHits > 0 && mode == 'map' && <div role="status" aria-live="polite" className="bg-primary-700 rounded-md p-4 text-white opacity-90 flex gap-4 items-center w-fit">
      <PiWarningFill className="inline text-xl"/> 
      <span>Kunne ikkje hente koordinatar</span>
    </div>}
    
    
    </div>
}

