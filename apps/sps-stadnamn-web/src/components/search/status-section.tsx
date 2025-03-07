'use client'
import { useContext } from 'react';
import { SearchContext } from '@/app/search-provider';
import ActiveFilters from './form/active-filters';
import { PiAlarmFill, PiInfoFill, PiWarningFill } from 'react-icons/pi';
import ModeSelector from '../tabs/mode-selector';
import { GlobalContext } from '@/app/global-provider';
import { useSearchParams, useRouter } from 'next/navigation';
import SortSelector from './sort/sort-selector'

export default function StatusSection() {
    const { resultData, resultBounds, isLoading, coordinatesError, searchError } = useContext(SearchContext)
    const searchParams = useSearchParams()
    const mode = searchParams.get('mode') || 'map'
    const { isMobile } = useContext(GlobalContext)
    const router = useRouter()
    const doc = searchParams.get('doc')

    return <div className="flex flex-col gap-2"> 
    <div className={`flex gap-1 flex-wrap items-center ${(mode == 'map' && !isMobile) ? 'lg:mt-2' : ''} ${isMobile ? 'mx-1 mt-1' : ''}`}>
    <ModeSelector/>
    {mode == 'list' && <SortSelector/>}

    { (mode != 'doc') && <ActiveFilters/> }
    </div>
    { (mode == 'map' && !isLoading && !resultBounds?.length && !searchError) ? <div role="status" aria-live="polite" className="bg-neutral-900 rounded-md p-4 text-white opacity-90 flex gap-2 items-center w-fit"><PiInfoFill className="inline text-xl"/> Ingen treff med koordinatar</div> : null}
    { searchError && <div role="status" aria-live="polite" className="bg-primary-700 rounded-md p-4 text-white opacity-90 flex gap-4 items-center w-fit">
        <PiWarningFill className="inline text-xl"/> 
        <span>Kunne ikkje hente søkeresultat</span>
      </div>
    }
    { !searchError && coordinatesError && <div role="status" aria-live="polite" className="bg-primary-700 rounded-md p-4 text-white opacity-90 flex gap-4 items-center w-fit">
      <PiWarningFill className="inline text-xl"/> 
      <span>Kunne ikkje hente koordinatar</span>
    </div>}
        
    
    </div>
}

