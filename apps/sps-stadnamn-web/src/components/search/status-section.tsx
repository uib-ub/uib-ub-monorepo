'use client'
import { useContext } from 'react';
import ActiveFilters from './form/active-filters';
import { PiInfoFill, PiWarningFill } from 'react-icons/pi';
import ModeSelector from '../tabs/mode-selector';
import { GlobalContext } from '@/app/global-provider';
import SortSelector from './sort/sort-selector'
import { useMode } from '@/lib/param-hooks';
import { useSearchParams } from 'next/navigation';
import useSearchData from '@/state/hooks/search-data';

export default function StatusSection() {
    const { searchBounds, searchLoading, searchError, totalHits } = useSearchData()
    const mode = useMode()
    const { isMobile } = useContext(GlobalContext)
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const group = searchParams.get('group')
    const datasetTag = searchParams.get('datasetTag')

    return <div className={`flex flex-col gap-2 ${mode != 'map' ? 'bg-white shadow-lg rounded-md' : ''}`}> 
    <div className={`flex gap-1 items-start ${(mode == 'map' && !isMobile) ? 'lg:mt-2' : 'items-center'}`}>
    {datasetTag != 'base' && !isMobile && <ModeSelector/>}
    
    
    { !isMobile && <div className={`flex flex-wrap ${datasetTag == 'base' ? 'm-2': 'p-1'} xl:flex-row h-full xl:py-0 gap-2`}><ActiveFilters/> </div> }




    </div>
    {mode == 'list' && (!doc && !group) && datasetTag != 'base' && <div className="flex flex-wrap xl:flex-row h-full p-2 px-6 gap-1"><SortSelector/></div>}
    
    


    {mode == 'map' && <div className="flex flex-wrap gap-2 mx-1.5 xl:mx-0">
    { (!searchLoading && !searchBounds?.length && !searchError && totalHits?.value > 0) ? <div role="status" aria-live="polite" className="bg-neutral-900 rounded-md p-4 text-white opacity-90 flex gap-2 items-center w-fit"><PiInfoFill className="inline text-xl"/> Ingen treff med koordinatar</div> : null}
    { ( !searchLoading && !searchError && totalHits?.value == 0) ? <div role="status" aria-live="polite" className="bg-neutral-900 rounded-md p-4 text-white opacity-90 flex gap-2 items-center w-fit"><PiInfoFill className="inline text-xl"/> Ingen treff</div> : null}
    </div>}
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

