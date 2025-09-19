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
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
    const setCurrentPosition = useSessionStore((s) => s.setCurrentPosition)


    return <div className={`flex flex-col gap-2 ${mode == 'map' ? '' : 'px-2 pt-4 pb-2'}`}> 
    <div className={`flex gap-1 items-start`}>
    
    
    <div className={`flex flex-wrap  xl:flex-row h-full gap-2`}>
      
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

