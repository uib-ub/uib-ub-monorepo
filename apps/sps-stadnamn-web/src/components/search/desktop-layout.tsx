'use client'
import SearchResults from "./results/search-results"
import TreeResults from "./results/tree-results"
import MapExplorer from "./map-explorer"
import { useQueryState } from "nuqs"
import InfoContent from "./info/info-content"
import { useDataset, useSearchQuery } from "@/lib/search-params"
import StatusSection from "./status-section"
import Facets from "./facets/facet-section"
import CadastralSubdivisions from "../children/cadastral-subdivisions"
import { treeSettings } from "@/config/server-config"
import DatasetDrawer from "./datasets/dataset-drawer"
import TableExplorer from "./table/table-explorer"
import NavSelector from "../tabs/nav-selector"
import { PiXBold } from "react-icons/pi"
import SourceList from "./results/source-list"
import { useContext } from "react"
import { DocContext } from "@/app/doc-provider"
import Spinner from "../svg/Spinner"
import { useSearchParams } from "next/navigation"
import { ChildrenContext } from "@/app/children-provider"
import DocSkeleton from "./info/doc-skeleton"

export default function DesktopLayout() {
    const searchParams = useSearchParams()

    
    const { searchFilterParamsString } = useSearchQuery()
    const [doc, setDoc] = useQueryState('doc')
    const [mode, setMode] = useQueryState('mode', {history: 'push', defaultValue: 'map'})
    const dataset = useDataset()
    const { parentLoading, parentData, docLoading } = useContext(DocContext)
    const { childrenLoading } = useContext(ChildrenContext)
    const parent = searchParams.get('parent')



    // Keep filters or expanded open when switching to a different section
    const nav = searchParams.get('nav') || 'datasets'

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
        { searchFilterParamsString && nav == 'results' &&
            <SearchResults isMobile={false}/>

        }
        

        
         { nav == 'datasets' &&     
            <DatasetDrawer/>
                
        }
        </div>
       

        </div>


       { mode != 'table' && (doc || parent) &&
        <div className="lg:absolute right-0 top-0 pb-6 flex flex-col items-end p-2 justify-between gap-2 h-full">
        <div className={`flex flex-col  w-[30svw] 2xl:w-[25svw] !z-[3001] ${parent ? 'lg:max-h-[50svh] lg:min-h-[25svh]' :  'lg:max-h-[calc(100svh - 2rem)] lg:min-h-[25svh]'}`}>
        {doc && !docLoading && <div className={`bg-white relative lg:rounded-md lg:shadow-md break-words pr-4 pl-4 py-2 overflow-y-auto stable-scrollbar`}>
            <InfoContent/>
        </div>}
        { docLoading && <div className="bg-white relative lg:rounded-md lg:shadow-md break-words p-4 overflow-y-auto stable-scrollbar"><DocSkeleton/></div> }
        
        </div>
        {parent ? 
            (parentLoading || childrenLoading) ? 

            <div className="rounded-md shadow-md !z-[3001] bg-white w-12 h-12 flex justify-center items-center"><Spinner status={treeSettings[dataset] ? 'Laster garder' : 'Laster kilder'} className="w-full h-full m-2 self-center" /></div>

        
            :
        <div className={`flex-col gap-2 max-w-[40svw] min-w-[20svw] !z-[3001]`}>
                <div className="rounded-md shadow-md bg-white max-h-[40svh] overflow-auto">

                   { treeSettings[dataset] ?  
                      parentData?._id && <CadastralSubdivisions isMobile={false}/>
                   :  dataset == 'search' && <div className="p-2"><SourceList/></div>}
                </div>
            </div>

            : null
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