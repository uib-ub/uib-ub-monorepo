
'use client'
import { useContext } from 'react';
import { SearchContext } from '@/app/search-provider';
import ActiveFilters from './form/active-filters';
import { useQueryState } from 'nuqs';
import { PiInfoFill } from 'react-icons/pi';
import ModeSelector from '../tabs/mode-selector';
import { GlobalContext } from '@/app/global-provider';
export default function StatusSection() {
    const { resultData, resultBounds, isLoading } = useContext(SearchContext)
    const mode = useQueryState('mode', {defaultValue: 'map'})[0]
    const { isMobile } = useContext(GlobalContext)

    return <div className="flex flex-col gap-2"> 
    <div className={`flex gap-2 flex-wrap items-center ${(mode == 'map' || isMobile) ? 'mt-2' : ''} ${isMobile ? 'mx-2' : ''}`}>
    <ModeSelector/>

    {  <ActiveFilters/> }
    </div>
    { (mode == 'map' && resultData?.length && !resultBounds?.length && !isLoading) ? <div role="status" aria-live="polite" className="bg-neutral-900 rounded-md p-4 text-white opacity-90 flex gap-2 items-center self-center"><PiInfoFill className="inline text-xl"/> Ingen treff med koordinater</div> : null}
        
    
    </div>
}

