
'use client'
import { useContext } from 'react';
import { SearchContext } from '@/app/search-provider';
import ActiveFilters from './form/active-filters';
import { useQueryState } from 'nuqs';
import { PiInfoFill } from 'react-icons/pi';
import { useSearchQuery } from '@/lib/search-params';
import { useSearchParams } from 'next/navigation';
import ModeSelector from '../tabs/mode-selector';
export default function StatusSection({isMobile}: {isMobile: boolean}) {

    const { resultData, resultBounds, isLoading } = useContext(SearchContext)
    const mode = useQueryState('mode', {defaultValue: 'map'})[0]
    const { facetFilters } = useSearchQuery()
    const searchParams = useSearchParams()

    return <div className="flex flex-col gap-2"> 
    <div className="flex gap-2 mt-2">
    <ModeSelector/>

    {  <ActiveFilters/> }
    </div>
    { (mode != 'table' && resultData?.length && !resultBounds?.length && !isLoading) ? <div role="status" aria-live="polite" className="bg-neutral-900 rounded-md p-4 text-white opacity-90 flex gap-2 items-center self-center"><PiInfoFill className="inline text-xl"/> Ingen treff med koordinater</div> : null}
        
    
    </div>
}

