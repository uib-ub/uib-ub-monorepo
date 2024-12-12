'use client'
import SearchResults from "./results/search-results"
import TreeResults from "./results/tree-results"
import MapExplorer from "./map-explorer"
import { useQueryState } from "nuqs"
import { useContext, useEffect, useState } from "react"
import InfoContent from "./info/info-content"
import { PiCaretDownBold, PiCaretUpBold, PiXBold } from "react-icons/pi"
import { useDataset, useSearchQuery } from "@/lib/search-params"
import StatusSection from "./status-section"
import Facets from "./facets/facet-section"
import { SearchContext } from "@/app/search-provider"
import Spinner from "../svg/Spinner"
import CadastralSubdivisions from "../doc/cadastral-subdivisions"
import { treeSettings } from "@/config/server-config"
import { DocContext } from "@/app/doc-provider"
import { useSearchParams } from "next/navigation"
import Datasets from "./datasets/dataset-drawer"
import DatasetDrawer from "./datasets/dataset-drawer"
import TableExplorer from "./table/table-explorer"
import ModeSelector from "../tabs/mode-selector"
import NavSelector from "../tabs/nav-selector"

export default function DesktopLayout() {

    
    const { searchFilterParamsString } = useSearchQuery()
    const searchParams = useSearchParams()
    const [doc, setDoc] = useQueryState('doc')
    const [point, setPoint] = useQueryState('point')
    
    const selectedDocState = useState<any | null>(null)
    const { totalHits, isLoading} = useContext(SearchContext)
    const [facetIsLoading, setFacetIsLoading] = useState<boolean>(false)
    const [within, setwithin] = useQueryState('within')
    const [mode, setMode] = useQueryState('mode', {history: 'push', defaultValue: 'map'})
    const dataset = useDataset()
    

    // Keep filters or expanded open when switching to a different section
    const [nav, setNav] = useQueryState('nav', {history: 'push', defaultValue: searchFilterParamsString && mode != 'table' ? 'results' : 'filters'})

    const [ showLoading, setShowLoading ] = useState<string|null>(null)

    const { docLoading } = useContext(DocContext)

    const [attestationLabel, setAttestationLabel] = useQueryState('attestationLabel')
    const [attestationYear, setAttestationYear] = useQueryState('attestationYear')

    


    return <main id="main" className="flex relative w-[100svw] h-[calc(100svh-3rem)] lg:h-[calc(100svh-3rem)]">   

        
        <div className="flex lg:gap-4 flex-col h-full max-h-full w-[40svw] lg:w-full overflow-y-auto lg:overflow-y-hidden">
        

        <div className={`lg:absolute left-2 top-2 flex-col gap-2 max-h-[calc(100svh-6rem)] max-w-[40svw] lg:w-[calc(25svw-1rem)] !z-[3001] bg-white shadow-md rounded-md`}>

        <NavSelector leftSection={nav}/>
        <div className="overflow-y-auto stable-scrollbar ml-2 max-h-[calc(100svh-10rem)] py-3">

        { nav == 'tree' && 
            <TreeResults isMobile={false}/>
        }

        
        { nav == 'filters' &&
                <Facets/>
        }
        { searchFilterParamsString && (nav == 'results' || !nav) &&
            <SearchResults isMobile={false}/>

        }
        

        
         { nav == 'datasets' &&     
            <DatasetDrawer/>
                
        }
        </div>
       

        </div>


       { mode != 'table' && (doc || point) &&
        <div className="lg:absolute right-0 top-0 pb-4 flex flex-col justify-between items-end h-full">
        <div className={`py-2 lg:p-2 flex flex-col gap-2 w-[30svw] 2xl:w-[25svw] !z-[3001] h-full ${within ? 'lg:max-h-[50svh]' :  'lg:max-h-[calc(100svh - 500px)]'}`}>
        <div className={`bg-white relative lg:rounded-md lg:shadow-md break-words p-4 overflow-y-auto stable-scrollbar`}>
            <button className="absolute right-0 top-2" onClick={() => { setDoc(null); setPoint(null); setAttestationLabel(null); setAttestationYear(null); } } aria-label="lukk"><PiXBold className="text-2xl text-neutral-600" aria-hidden={true}/></button>
            <InfoContent/>
        </div>
        </div>

        { within && treeSettings[dataset] && <div className={`lg:p-2 flex-col gap-2 max-w-[40svw] ] !z-[3001]`}>
                <div className="rounded-md shadow-md bg-white max-h-[40svh] overflow-auto">
                    <CadastralSubdivisions isMobile={false}/>
                </div>
            </div>
        }

        </div>
        }
        </div>
    
        <div className={`absolute top-0 left-[25svw] ${mode == 'table' ? 'w-[75svw]' : 'max-w-[50svw] z-[2000]'} flex flex-col gap-2`}><StatusSection isMobile={false}/>
            {mode == 'table' &&
                <div className="bg-white rounded-md shadow-md mr-4">
                        <TableExplorer/>
                </div>}
        </div>
        { mode == 'map' &&
            <div className="absolute top-0 right-0 h-full w-[60svw] lg:w-full">
            
                <MapExplorer isMobile={false}/>
            </div>
        }


    </main>

}