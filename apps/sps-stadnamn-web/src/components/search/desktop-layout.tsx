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
import { PiArrowUpBold, PiFilesFill, PiHouseFill, PiInfoFill, PiTableFill, PiTagFill, PiTrash, PiTrashFill, PiXBold } from "react-icons/pi"
import SourceList from "../children/source-list"
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
import ClickableIcon from "../ui/clickable/clickable-icon"
import { getValueByPath } from "@/lib/utils"

export default function DesktopLayout() {
    const [doc, setDoc] = useQueryState('doc')
    const [mode, setMode] = useQueryState('mode', {history: 'push', defaultValue: 'map'})
    const dataset = useDataset()
    const { parentLoading, parentData, docLoading, docData, docView } = useContext(DocContext)
    const { childrenLoading, childrenData, childrenCount, shownChildrenCount } = useContext(ChildrenContext)
    const searchParams = useSearchParams()
    const parent = searchParams.get('parent')
    const sourceLabel = searchParams.get('sourceLabel')
    const sourceDataset = searchParams.get('sourceDataset')



    return <main id="main" className="flex scroll-container relative w-[100svw] h-[calc(100svh-3rem)] lg:h-[calc(100svh-3rem)]">   

        
        <div className="flex lg:gap-4 flex-col h-full max-h-full w-[40svw] lg:w-full overflow-y-auto lg:overflow-y-hidden">
        

        <div className={`lg:absolute left-2 top-2 flex-col gap-2 max-w-[40svw] lg:w-[calc(25svw-1rem)] !z-[3001] bg-white shadow-lg lg:rounded-md ${doc || parent ? 'hidden lg:flex' : ''}`}>

        <LeftWindow/>
        
       

        </div>

        <div className={`absolute ${mode == 'map' ? 'top-0 left-[40svw] lg:left-[25svw] max-w-[calc(60svw-0.5rem)] lg:max-w-[calc(50svw-0.5rem)] z-[2000]': 'top-2 left-[40svw] lg:left-[25svw] w-[calc(60svw-0.5rem)] lg:w-[calc(75svw-0.5rem)] max-h-[calc(100svh-4rem)] bg-white rounded-md shadow-lg overflow-y-auto stable-scrollbar' } flex flex-col gap-2 `}>
            <StatusSection/>

            {mode == 'table' && !doc && <TableExplorer/> }
            {mode != 'map' && (parent || doc) &&  <DocExplorer hidden={false}/>}


            {mode == 'list' && !doc && <ListExplorer/> }
        </div>


       { mode == 'map' && (doc || parent) &&
        <div className="lg:absolute lg:right-0 lg:top-0 flex flex-col lg:items-end lg:p-2 lg:pb-6 lg:justify-between lg:gap-4 h-full">
        <div className={`flex flex-col  lg:w-[30svw] 2xl:w-[25svw] !z-[3001] ${parent ? ' lg:min-h-[25svh]' :  'lg:max-h-[calc(100svh - 2rem)] lg:min-h-[25svh]'}`}>
        {doc && !docLoading && docData?._source && <div className={`bg-white relative lg:rounded-md lg:shadow-lg break-words pr-4 pl-4  py-2 overflow-y-auto stable-scrollbar ${parent && parent == doc ? 'hidden lg:block' : ''}`}>
            <DocInfo/>
        </div>}
        { docLoading && <div className="bg-white relative lg:rounded-md lg:shadow-lg break-words p-4 overflow-y-auto stable-scrollbar"><DocSkeleton/></div> }
        
        </div>
        { parent && (dataset == 'search' || treeSettings[dataset]) ?
         <div id="children-window" className={`lg:rounded-md lg:shadow-lg !z-[3001] bg-white flex ${parent != doc ? 'mt-2' : ''} flex flex-col instance-info   ${childrenLoading ? 'p-4 justify-center items-center' : 'justify-start'} lg:min-h-[30svh] lg:max-h-[30svh] ${dataset == 'search' ? 'lg:w-[30svw] 2xl:w-[25svw]' : 'lg:max-w-[45svw] lg:min-w-[25svw]'}`}>
            {childrenLoading ? <Spinner className="h-16 w-16 " status="Lastar kjelder"/> : <>
            
            { parentData && (dataset == 'search' || treeSettings[dataset]) &&
                <div className={`flex w-full items-center shadow-md`}>
                    
                    <h2 className="flex items-center gap-1 p-1 px-2">
                        
                            <ClickableIcon
                                link
                                label={dataset == 'search' ? "Vis stadnamnoppslag" : "Vis gard"}
                                aria-current={doc == parent ? 'page' : undefined}
                                className="group p-1 hover:bg-neutral-100 rounded-full border-2 border-transparent aria-[current='page']:border-accent-800"
                                add={{doc: parent}}>
                                <PiHouseFill className={`text-primary-600 group-aria-[current='page']:text-accent-800 text-xl`} />
                            </ClickableIcon>
                        
                        <div className="text-xl flex items-center gap-1 flex-col lg:flex-row">
                            <div className="max-w-[20svw] lg:!max-w-[10svw] truncate sr-only lg:not-sr-only">
                                {treeSettings[dataset] && ((getValueByPath(parentData._source, treeSettings[dataset]?.subunit) || parentData?._source?.cadastre?.[0]?.gnr?.join(",")) + " ")}
                                {parentData?._source.label}
                            </div> 
                            <span className="sr-only lg:not-sr-only"> | </span>Kjelder
                        </div>
                        { (childrenCount && childrenCount == childrenData?.length) ?
                            <div className="!h-6 self-center text-base flex items-center font-bold bg-neutral-50 border border-neutral-200 text-neutral-950 rounded-full px-2 !font-sans">
                            {childrenCount != shownChildrenCount ? `${shownChildrenCount}/${childrenCount}` : childrenCount}
                            </div> : null
                        }
                    </h2>
                    {(sourceLabel || sourceDataset) && <ClickableIcon label="Fjern filtrering" remove={["sourceDataset", "sourceLabel"]}><PiTrashFill className="text-neutral-800 text-2xl"/></ClickableIcon>}
                    
                    
                    {parent && !childrenLoading && <Clickable link remove={["parent", "sourceDataset", "sourceLabel"]} add={docView?.current ? docView.current : {}} className="text-neutral-800 text-2xl p-2 ml-auto"><PiXBold/></Clickable>}
                </div>
            }

            {parentData && 
                <div className="h-full  overflow-y-auto stable-scrollbar px-2">
                    {treeSettings[dataset] && <CadastralSubdivisions/>}
                    {dataset == 'search' && <SourceList/>}
                </div>
            }
            </>
            }
         
        </div>
        : null

        }       

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