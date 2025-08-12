'use client'
import MapExplorer from "./map-explorer"
import { usePerspective, useMode } from "@/lib/search-params"
import StatusSection from "./status-section"
import TableExplorer from "./table/table-explorer"
import { useContext } from "react"
import { DocContext } from "@/app/doc-provider"
import { useSearchParams } from "next/navigation"
import DocSkeleton from "../doc/doc-skeleton"
import DocInfo from "./details/doc/doc-info"
import ListExplorer from "./list/list-explorer"
import NavWindow from "./nav/nav-window"
import DetailsWindow from "./details/details-window"
import FuzzyWindow from "./fuzzy/fuzzy-window"

export default function DesktopLayout() {    
    const { docLoading } = useContext(DocContext)
    const searchParams = useSearchParams()
    const fuzzyNav = searchParams.get('fuzzyNav')
    const mode = useMode()
    const doc = searchParams.get('doc')
    const details = searchParams.get('details')
    const nav = searchParams.get('nav')
    const group = searchParams.get('group')
    const perspective = usePerspective()

    return <main id="main" className="flex scroll-container relative w-[100svw] h-[calc(100svh-3rem)]">   

        
        <div className="flex lg:gap-4 flex-col h-full w-[40svw] lg:w-full max-h-[calc(100svh-4rem)] ">
        

        {  (!doc || mode == 'map') && !fuzzyNav && <section aria-label="Søkeverktøy" className={`xl:absolute left-2 top-2 flex-col lg:w-[calc(25svw-1rem)] max-w-[40svw] !z-[3001] bg-white shadow-lg rounded-b-md lg:rounded-md flex ${details ? 'hidden lg:flex' : 'flex'}`}>
        { <NavWindow/>}       
        </section> }

        

        { mode != 'map' && doc && <section className={`lg:absolute left-2 top-2 flex-col max-w-[40svw] lg:w-[calc(25svw-1rem)] !z-[3001] bg-white shadow-lg lg:rounded-md ${(doc || parent) ? 'flex' : 'flex'}`}>

            <DetailsWindow/>



            </section>
        }

        <div className={`absolute 
                left-[40svw] lg:left-[25svw] w-[calc(60svw-0.5rem)] lg:w-[calc(75svw-0.5rem)] max-h-[calc(100svh-4rem)] max-h-[calc(100svh-20rem)]
                                        
                ${mode == 'map' ? 'top-0   lg:max-w-[calc(50svw-0.5rem)] z-[2000]'
                                : 'top-2 bg-white rounded-md shadow-lg max-h-[calc(100svh-4rem)] overflow-y-auto stable-scrollbar' } 
                flex flex-col pb-6`}>
            {mode != 'doc' && <StatusSection/>}

            {mode == 'table' && <TableExplorer/> }
            {mode == 'list' && <ListExplorer/> }
            {mode == 'doc' && <div className="px-6 pb-6 pt-3">
                {docLoading ? <DocSkeleton/> : <DocInfo/>}
            </div>}
        </div>


       { mode == 'map' && (doc || group) && searchParams.get('details') &&
        <div className="lg:absolute lg:right-2 lg:top-2 flex-col max-w-[40svw] xl:w-[calc(25svw-1rem)] !z-[3001] bg-white shadow-lg xl:rounded-md xl:flex">
        
        <DetailsWindow/> 
        </div>
        }

{  (!doc || mode == 'map') && fuzzyNav && <div className={`xl:absolute left-2 top-2 flex-col lg:w-[calc(25svw-1rem)] max-w-[40svw] !z-[3001] bg-white shadow-lg rounded-b-md lg:rounded-md flex ${details ? 'hidden lg:flex' : 'flex'}`}>
        <FuzzyWindow/>       
        </div> }


        {  fuzzyNav && mode == 'map' && (doc || group) && searchParams.get('details') &&
        <div className="lg:absolute lg:right-2 lg:top-2 flex-col max-w-[40svw] xl:w-[calc(25svw-1rem)] !z-[3001] bg-white shadow-lg xl:rounded-md xl:flex">
        
        <DetailsWindow/> 
        </div>
        }



        </div>
    
        { mode == 'map' && perspective != 'grunnord' &&
            <div className="absolute top-0 right-0 h-full w-full">
            
                <MapExplorer/>
            </div>
        }


    </main>

}