'use client'
import { useMode } from '@/lib/param-hooks';
import StatusSection from "./status-section"
import TableExplorer from "./table/table-explorer"
import { useSearchParams } from "next/navigation"
import ListExplorer from "./list/list-explorer"
import NavWindow from "./nav/nav-window"
import DetailsWindow from "./details/details-window"
import NamesWindow from "./names/names-window"
import MapWrapper from "./map-wrapper"

export default function DesktopLayout() {    
    const searchParams = useSearchParams()
    const namesNav = searchParams.get('namesNav')
    const mode = useMode()
    const doc = searchParams.get('doc')
    const details = searchParams.get('details')
    const group = searchParams.get('group')
    

    return <main id="main" className="flex scroll-container relative w-[100svw] h-[calc(100svh-3rem)]">   

        
        <div className="flex lg:gap-4 flex-col h-full w-[40svw] lg:w-full max-h-[calc(100svh-4rem)] ">
        

        {  (mode == 'map' || (mode == 'table' ? details != 'doc' : true)) && !doc && <section aria-label="Søkeverktøy" className={`xl:absolute left-2 top-2 flex-col lg:w-[calc(25svw-1rem)] max-w-[40svw] !z-[3001] bg-white shadow-lg rounded-b-md lg:rounded-md flex ${details ? 'hidden lg:flex' : 'flex'}`}>
            <NavWindow/>  
        </section> 
        }

        

        { mode != 'map' && details && (details != 'doc' || mode == 'table') && details != 'group' && <section className={`lg:absolute left-2 top-2 flex-col max-w-[40svw] lg:w-[calc(25svw-1rem)] !z-[3001] bg-white shadow-lg lg:rounded-md ${(doc || parent) ? 'flex' : 'flex'}`}>

            <DetailsWindow/>



            </section>
        }

        <div className={`absolute
                left-[40svw] lg:left-[25svw] w-[calc(60svw-0.5rem)] lg:w-[calc(75svw-0.5rem)] max-h-[calc(100svh-20rem)]
                                        
                ${mode == 'map' ? 'top-0   lg:max-w-[calc(50svw-0.5rem)] z-[2000]'
                                : 'top-2 rounded-md max-h-[calc(100svh-3.5rem)]' } 
                flex flex-col pb-6`}>
            <StatusSection/>
            {mode != 'map' ? <div className="bg-white shadow-lg mt-2 rounded-md overflow-y-auto stable-scrollbar">

            {mode == 'table' && <TableExplorer/> }
            {mode == 'list' && <ListExplorer/> }

            </div> : null}
            
        </div>


       { mode == 'map' && (doc || group) && searchParams.get('details') &&
        <div className="lg:absolute lg:right-2 lg:top-2 flex-col max-w-[40svw] xl:w-[calc(25svw-1rem)] !z-[3001] bg-white shadow-lg xl:rounded-md xl:flex">
        
        <DetailsWindow/> 
        </div>
        }

{  doc && <div className={`xl:absolute left-2 top-2 flex-col lg:w-[calc(25svw-1rem)] max-w-[40svw] !z-[3001] bg-white shadow-lg rounded-b-md lg:rounded-md flex ${details ? 'hidden lg:flex' : 'flex'}`}>
        <NamesWindow/>       
        </div> }


        {  namesNav && mode == 'map' && (doc || group) && searchParams.get('details') &&
        <div className="lg:absolute lg:right-2 lg:top-2 flex-col max-w-[40svw] xl:w-[calc(25svw-1rem)] !z-[3001] bg-white shadow-lg xl:rounded-md xl:flex">
        
        <DetailsWindow/> 
        </div>
        }



        </div>
    

        {mode == 'map' && <div className="absolute top-0 right-0 h-full w-full">
            <MapWrapper/>   
        </div>}
        


    </main>

}