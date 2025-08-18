'use client'
import { useContext } from 'react';
import { SearchContext } from '@/app/search-provider';
import ActiveFilters from './form/active-filters';
import { PiCaretLeft, PiInfoFill, PiMagnifyingGlass, PiWarningFill, PiX, PiXBold } from 'react-icons/pi';
import ModeSelector from '../tabs/mode-selector';
import { GlobalContext } from '@/app/global-provider';
import SortSelector from './sort/sort-selector'
import { useMode, usePerspective, useSearchQuery } from '@/lib/search-params';
import { useRouter, useSearchParams } from 'next/navigation';
import Clickable from '../ui/clickable/clickable';
import DetailsTabs from './details/details-tabs';
import DocToolbar from './details/doc/doc-toolbar';
import HitNavigation from './details/hit-navigation';

export default function StatusSection() {
    const { resultBounds, isLoading, coordinatesError, searchError, setSearchError, totalHits } = useContext(SearchContext)
    const mode = useMode()
    const { isMobile } = useContext(GlobalContext)
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const group = searchParams.get('group')
    const perspective = usePerspective()
    const details = searchParams.get('details')
    const datasetTag = searchParams.get('datasetTag')

    return <div className="flex flex-col gap-2"> 
    <div className={`flex gap-1 flex-wrap w-fit ${mode != 'map' ? 'items-center' : ''} ${(mode == 'map' && !isMobile) ? 'lg:mt-2' : ''}`}>
    {datasetTag != 'base' && <ModeSelector/>}
    
    
    { ((datasetTag == 'base' || mode == 'map' || !details) && !isMobile) && <div className="flex flex-wrap xl:flex-row h-full p-1 xl:py-0 gap-2"><ActiveFilters showQuery={true} showFacets={true} showDatasets={true}/> </div> }




    </div>
    {mode == 'list' && (!doc && !group) && datasetTag != 'base' && <div className="flex flex-wrap xl:flex-row h-full p-2 px-6 gap-1"><SortSelector/></div>}
    
    


    {mode == 'map' && <div className="flex flex-wrap gap-2 mx-1.5 xl:mx-0">
    { (!isLoading && !resultBounds?.length && !searchError && totalHits?.value > 0) ? <div role="status" aria-live="polite" className="bg-neutral-900 rounded-md p-4 text-white opacity-90 flex gap-2 items-center w-fit"><PiInfoFill className="inline text-xl"/> Ingen treff med koordinatar</div> : null}
    { ( !isLoading && !searchError && totalHits?.value == 0) ? <div role="status" aria-live="polite" className="bg-neutral-900 rounded-md p-4 text-white opacity-90 flex gap-2 items-center w-fit"><PiInfoFill className="inline text-xl"/> Ingen treff</div> : null}
    </div>}
    { searchError && <div role="status" aria-live="polite" className="bg-primary-700 rounded-md p-4 text-white opacity-90 flex gap-4 items-center w-fit">
        <PiWarningFill className="inline text-xl"/> 
        <span>Kunne ikkje hente søkeresultat</span>
        <button onClick={() => setSearchError(null)}><PiXBold aria-hidden="true" className="inline text-xl"/></button>
      </div>
    }
    { !searchError && coordinatesError && mode == 'map' && <div role="status" aria-live="polite" className="bg-primary-700 rounded-md p-4 text-white opacity-90 flex gap-4 items-center w-fit">
      <PiWarningFill className="inline text-xl"/> 
      <span>Kunne ikkje hente koordinatar</span>
    </div>}
    
    
    </div>
}

