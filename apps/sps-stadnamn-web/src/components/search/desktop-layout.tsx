'use client'
import { useMode } from '@/lib/param-hooks';
import StatusSection from "./status-section"
import TableExplorer from "./table/table-explorer"
import { useSearchParams } from "next/navigation"
import ListExplorer from "./list/list-explorer"
import NavWindow from "./nav/nav-window"
import DetailsWindow from "./details/details-window"
import NamesWindow from "./names/names-window"
import MapWrapper from "../map/map-wrapper"
import TreeResults from './nav/results/tree-results';
import TreeWindow from './nav/tree-window';
import MapSettings from '../map/map-settings';
import { PiX } from 'react-icons/pi';
import ClickableIcon from '../ui/clickable/clickable-icon';
import { useSessionStore } from '@/state/zustand/session-store';
import FacetSection from './nav/facets/facet-section';
import DatasetFacet from './nav/facets/dataset-facet';
import LeftPanel from './nav/left-panel';

export default function DesktopLayout() {    
    const searchParams = useSearchParams()
    const details = searchParams.get('details')
    const mode = useMode()
    const doc = searchParams.get('doc')

    const group = searchParams.get('group')
    const nav = searchParams.get('nav')
    const setDrawerContent = useSessionStore((s) => s.setDrawerContent)

    const showResults = searchParams.get('showResults')
    const showOptions = searchParams.get('showOptions')
    const showGroup = searchParams.get('showGroup')

    const titles = {
        filters: 'Søkealternativ',
        results: mode == 'table' ? 'Tabellvisning' : 'Søkeresultat',
        datasets: 'Datasett',
    }
    

    return <main id="main" className="flex scroll-container relative w-[100svw] h-[100svh] bg-neutral-50">   

        
        <div className="flex lg:gap-4 flex-col h-full w-[40svw] lg:w-full max-h-[calc(100svh-4rem)] ">


             {
            nav == 'tree' && 
            <section aria-labelledby="tree-window-title" className="xl:absolute left-2 top-14 flex-col lg:w-[calc(25svw-1rem)] max-w-[40svw] !z-[3001] bg-white shadow-lg rounded-b-md lg:rounded-md flex">
            <TreeWindow/>
            </section>
        }


             {  mode == 'map' && (doc || group) &&
        <div className="lg:absolute lg:left-2 lg:top-16 flex-col max-w-[40svw] xl:w-[calc(25svw-1rem)] !z-[3001] bg-white shadow-lg xl:rounded-md xl:flex">
        
        <DetailsWindow/> 
        </div>
        }

        {  nav != 'tree' && mode != 'list' && mode != 'table' && 
         <LeftPanel/>
        }
        

        {  nav != 'tree' && mode != 'list' && mode != 'table' && 
         <NavWindow/>
        }

        

       


        


        <div className={`absolute
                left-[40svw] top-2 lg:left-[25svw]
                                        
                ${mode == 'map' ? 'lg:max-w-[calc(75svw-0.5rem)] lg:max-w-[calc(50svw-0.5rem)] max-h-[calc(100svh-20rem)] z-[2000]'
                                : 'max-h-[calc(100svh-3.5rem)]' } 
                flex flex-col`}>
            <StatusSection/>
            {mode != 'map' ? <div className="bg-white shadow-lg mt-2 rounded-md overflow-y-auto stable-scrollbar">

            {mode == 'table' && <TableExplorer/> }
            {mode == 'list' && <ListExplorer/> }

            </div> : null}
            
        </div>




        {  details && details != 'group' && <div className={`xl:absolute left-2 top-14 flex-col lg:w-[calc(25svw-1rem)] max-w-[40svw] !z-[3001] bg-white shadow-lg rounded-b-md lg:rounded-md flex ${(doc || group) ? 'hidden lg:flex' : 'flex'}`}>
            <NamesWindow/>       
        </div> }


       



        </div>
    

        {mode == 'map' && <div className="absolute top-0 right-0 h-full w-full">
            <MapWrapper/>   
        </div>}
        


    </main>

}