'use client'
import SearchResults from "./results/search-results"
import TreeResults from "./results/tree-results"
import MapExplorer from "./map-explorer"
import { useQueryState } from "nuqs"
import { useDataset, useSearchQuery } from "@/lib/search-params"
import StatusSection from "./status-section"
import Facets from "./facets/facet-section"
import CadastralSubdivisions from "../children/cadastral-subdivisions"
import { treeSettings } from "@/config/server-config"
import DatasetDrawer from "./datasets/dataset-drawer"
import TableExplorer from "./table/table-explorer"
import NavSelector from "../tabs/left-window"
import { PiArrowUpBold, PiFilesFill, PiTableFill, PiXBold } from "react-icons/pi"
import SourceList from "./results/source-list"
import { useContext } from "react"
import { DocContext } from "@/app/doc-provider"
import Spinner from "../svg/Spinner"
import { useSearchParams } from "next/navigation"
import { ChildrenContext } from "@/app/children-provider"
import DocSkeleton from "./info/doc-skeleton"
import DocInfo from "./info/doc-info"
import Clickable from "../ui/clickable/clickable"
import ListExplorer from "./list/list-explorer"
import DocExplorer from "./info/doc-explorer"
import LeftWindow from "../tabs/left-window"

export default function DesktopLayout() {
    const searchParams = useSearchParams()

    
    const { searchFilterParamsString } = useSearchQuery()
    const [doc, setDoc] = useQueryState('doc')
    const [mode, setMode] = useQueryState('mode', {history: 'push', defaultValue: 'map'})
    const dataset = useDataset()
    const { parentLoading, parentData, docLoading, docData } = useContext(DocContext)
    const { childrenLoading, childrenData } = useContext(ChildrenContext)

    const [parent, setParent] = useQueryState('parent')


    // Keep filters or expanded open when switching to a different section
    const nav = searchParams.get('nav')

    const [attestationLabel, setAttestationLabel] = useQueryState('attestationLabel')
    const [attestationYear, setAttestationYear] = useQueryState('attestationYear')


    


    return <main id="main" className="flex scroll-container relative w-[100svw] h-[calc(100svh-3rem)] lg:h-[calc(100svh-3rem)]">   

        
        <div className="flex lg:gap-4 flex-col h-full max-h-full w-[40svw] lg:w-full overflow-y-auto lg:overflow-y-hidden">
        

        <div className={`lg:absolute left-2 top-2 flex-col gap-2 max-w-[40svw] lg:w-[calc(25svw-1rem)] !z-[3001] bg-white shadow-md rounded-md`}>

        <LeftWindow/>
        
       

        </div>


       { mode == 'map' && (doc || parent) &&
        <div className="lg:absolute right-0 top-0 pb-6 flex flex-col items-end p-2 justify-between gap-2 h-full">
        <div className={`flex flex-col  w-[30svw] 2xl:w-[25svw] !z-[3001] ${parent ? 'lg:max-h-[50svh] lg:min-h-[25svh]' :  'lg:max-h-[calc(100svh - 2rem)] lg:min-h-[25svh]'}`}>
        {doc && !docLoading && docData?._source && <div className={`bg-white relative lg:rounded-md lg:shadow-md break-words pr-4 pl-4 py-2 overflow-y-auto stable-scrollbar`}>
            <DocInfo/>
        </div>}
        { docLoading && <div className="bg-white relative lg:rounded-md lg:shadow-md break-words p-4 overflow-y-auto stable-scrollbar"><DocSkeleton/></div> }
        
        </div>
        { docData?._source?.children?.length > 1 || parentData?._source?.children?.length > 1 || (treeSettings[dataset] && docData?._source?.sosi == 'gard') || parent ?
         <div className={`rounded-md shadow-md !z-[3001] bg-white  flex flex-col instance-info justify-start`}>
            { !treeSettings[dataset] &&<div className="flex">
            <h2><Clickable className={`flex gap-2 no-underline p-2 px-4 justify-start items-center text-neutral-950`} add={{parent: docData?._source.uuid}}>

            

             <><PiFilesFill className="text-2xl text-primary-600"/><span className="text-xl">Kilder</span><div className="!h-6 self-center text-base flex items-center font-bold bg-neutral-50 border border-neutral-200 text-neutral-950 rounded-full px-2 !font-sans">{docData?._source?.children?.length || childrenData?.length}</div></>
            

            
            
            </Clickable>
            </h2>
            

            {parent && parent != doc && <Clickable link className="flex gap-2 no-underline px-2 justify-start items-center" add={{doc: parent}}><PiArrowUpBold className="text-neutral-800 text-xl"/> Stadnamnoppslag</Clickable>}
            {parent && <button onClick={() => setParent(null)} className="text-neutral-800 text-2xl p-2 ml-auto"><PiXBold/></button>}
            
            </div>
            }
            { treeSettings[dataset] && docData?._source?.sosi == 'gard' && (!parent || childrenLoading) &&
            <div className="flex w-full">
                <h2 className={`flex gap-2 no-underline justify-start items-center w-full text-neutral-950`}>
                    <Clickable link className="flex gap-2 no-underline p-2 px-4 justify-start items-center" add={{parent: docData?._source.uuid}}>
                    <PiTableFill className={`text-2xl text-primary-600`}/><span className={`text-xl`}>Underordna bruk</span>
                    </Clickable>
                    {childrenLoading && <Spinner  className="ml-auto mr-2" status="Laster underordna bruk"/>}
                </h2>
                </div>
            
            }


            {parent && <div className="max-h-[40svh] min-w-[25svw] max-w-[35svw] overflow-y-auto stable-scrollbar px-2">
            
            {treeSettings[dataset] ?  
                      parentData?._id && <CadastralSubdivisions/>
                   :  dataset == 'search' && <SourceList/>}
            </div>}
        </div>
        : null

        }       

        </div>
        }
        </div>
    
        <div className={`absolute top-0 left-[25svw] ${mode == 'map' ? 'max-w-[calc(50svw-0.5rem)] z-[2000]': 'w-[calc(75svw-0.5rem)] max-h-[calc(100svh-4rem)] top-2 bg-white rounded-md shadow-md overflow-y-auto stable-scrollbar' } flex flex-col gap-2 `}>
            <StatusSection/>

            {mode == 'table' && !doc && <TableExplorer/> }
            {mode != 'map' && (parent || doc) &&  <DocExplorer hidden={false}/>}


            {mode == 'list' && !doc && <ListExplorer/> }
        </div>
        { mode == 'map' &&
            <div className="absolute top-0 right-0 h-full w-[60svw] lg:w-full">
            
                <MapExplorer/>
            </div>
        }


    </main>

}