'use client'
import MapExplorer from "./map-explorer"
import { useDataset, useMode } from "@/lib/search-params"
import StatusSection from "./status-section"
import TableExplorer from "./table/table-explorer"
import { useContext } from "react"
import { DocContext } from "@/app/doc-provider"
import Spinner from "../svg/Spinner"
import { useSearchParams } from "next/navigation"
import { ChildrenContext } from "@/app/children-provider"
import DocSkeleton from "../doc/doc-skeleton"
import DocInfo from "./details/doc/doc-info"
import ListExplorer from "./list/list-explorer"
import NavWindow from "./nav/nav-window"
import ChildrenWindow from "../children/children-window"
import { treeSettings } from "@/config/server-config"
import { PiBinoculars, PiBinocularsLight, PiBookOpen, PiBookOpenLight, PiBooks, PiCaretLeft, PiCaretRight, PiClockCounterClockwiseLight, PiClockLight, PiDatabaseLight, PiEye, PiFileText, PiFunnelLight, PiInfinity, PiInfoLight, PiListBullets, PiListBulletsLight, PiListMagnifyingGlass, PiListMagnifyingGlassLight, PiMagnifyingGlass, PiTimerLight, PiTreeViewLight, PiX } from "react-icons/pi"
import IconButton from "../ui/icon-button"
import ClickableIcon from "../ui/clickable/clickable-icon"
import CopyLink from "../doc/copy-link"
import Link from "next/link"
import DetailsWindow from "./details/details-window"
import ParentWindow from "./parent/parent-window"

export default function DesktopLayout() {    
    const dataset = useDataset()
    const { parentLoading, parentData, docLoading, docData } = useContext(DocContext)
    const { childrenLoading } = useContext(ChildrenContext)
    const searchParams = useSearchParams()
    const parent = searchParams.get('parent')
    const mode = useMode()
    const doc = searchParams.get('doc')
    const details = searchParams.get('details') || 'doc'
    const nav = searchParams.get('nav')

    return <main id="main" className="flex scroll-container relative w-[100svw] h-[calc(100svh-3rem)] lg:h-[calc(100svh-3rem)]">   

        
        <div className="flex lg:gap-4 flex-col h-full max-h-full w-[40svw] lg:w-full overflow-y-auto lg:overflow-y-hidden">
        

        { (!doc || mode == 'map') && <section aria-label="Søkeverktøy" className={`lg:absolute left-2 top-2 flex-col  ${(nav || mode == 'map' )? 'lg:w-[calc(25svw-1rem)] max-w-[40svw]' : ''} !z-[3001] bg-white shadow-lg lg:rounded-md ${(doc || parent) ? 'hidden lg:flex' : 'flex'}`}>
        {parent ? <ParentWindow/> : <NavWindow/>}       
        </section> }

        






        { mode != 'map' && doc && <section className={`lg:absolute left-2 top-2 flex-col  ${details? 'lg:w-[calc(25svw-1rem)] max-w-[40svw]' : ''} !z-[3001] bg-white shadow-lg lg:rounded-md ${(doc || parent) ? 'hidden lg:flex' : 'flex'}`}>

            <DetailsWindow/>



            </section>
        }

        <div className={`absolute 
                ${(mode == 'doc' && parent) ? 'left-[40svw] lg:left-[25svw] w-[calc(60svw-0.5rem)] lg:w-[calc(50svw-1rem)]' 
                                            :  (mode == 'map' || nav || details) ? 'left-[40svw] lg:left-[25svw] w-[calc(60svw-0.5rem)] lg:w-[calc(75svw-0.5rem)] max-h-[calc(100svh-4rem)]'
                                            : 'left-20'}
                                        
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

        {(mode == 'doc' && parent) ?
            <div className="lg:absolute lg:right-0 lg:top-0 lg:w-[25svw] h-[calc(100svh-4rem)] lg:m-2 rounded-md shadow-lg lg:gap-4 bg-white">
                { (parentLoading || childrenLoading) ? <div className="flex justify-center items-center h-full"><Spinner className="h-16 w-16 " status="Lastar kjelder"/></div> : <ChildrenWindow/>}
            </div>
        : null}




       { mode == 'map' && (doc || parent) && searchParams.get('details') &&
        <div className="lg:absolute right-2 top-2 flex-col max-w-[40svw] lg:w-[calc(25svw-1rem)] !z-[3001] bg-white shadow-lg lg:rounded-md hidden lg:flex">
        
        
        <DetailsWindow/> 

        </div>
        }
        </div>
    
        { mode == 'map' &&
            <div className="absolute top-0 right-0 h-full w-[60svw] lg:w-full">
            
                <MapExplorer/>
            </div>
        }


    </main>

}