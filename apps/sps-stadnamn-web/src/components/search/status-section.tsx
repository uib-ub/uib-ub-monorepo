
'use client'
import { useContext } from 'react';
import { SearchContext } from '@/app/map-search-provider';
import ActiveFilters from './form/active-filters';
import { useQueryState } from 'nuqs';
import { PiInfoFill } from 'react-icons/pi';
import { useSearchQuery } from '@/lib/search-params';
export default function StatusSection({isMobile}: {isMobile: boolean}) {

    const { resultData, resultBounds } = useContext(SearchContext)
    const expanded = useQueryState('expanded')[0]
    const mode = useQueryState('mode', {defaultValue: 'search'})[0]
    const { facetFilters } = useSearchQuery()

    return (isMobile || expanded != 'options') && mode == 'search' && <>
            { facetFilters?.length > 0 && <ActiveFilters/> }
            { resultData?.length ? !resultBounds?.length && <div role="status" aria-live="polite" className="bg-neutral-900 rounded-md p-4 text-white opacity-90 flex gap-2 items-center self-center"><PiInfoFill className="inline text-xl"/> Ingen treff med koordinater</div> : null}
        
    </>
}

