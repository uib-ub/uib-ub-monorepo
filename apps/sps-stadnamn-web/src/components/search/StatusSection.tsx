
'use client'
import { useContext } from 'react';
import { SearchContext } from '@/app/map-search-provider';
import ActiveFilters from './formSection/ActiveFilters';
import { useQueryState } from 'nuqs';
import { PiInfoFill } from 'react-icons/pi';
export default function StatusSection({isMobile}: {isMobile: boolean}) {

    const { resultData, resultBounds } = useContext(SearchContext)
    const expanded = useQueryState('expanded')[0]

    return (isMobile || expanded != 'options') && <>
            <ActiveFilters/>
            { resultData?.length && !resultBounds?.length && <div role="status" aria-live="polite" className="bg-neutral-900 rounded-md p-4 text-white opacity-90 flex gap-2 items-center self-center"><PiInfoFill className="inline text-xl"/> Ingen treff med koordinater</div>}
        
    </>
}

       

