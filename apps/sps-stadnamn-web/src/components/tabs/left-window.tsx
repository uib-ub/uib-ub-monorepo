import { contentSettings, treeSettings } from "@/config/server-config";
import { useDataset, useMode, useSearchQuery } from "@/lib/search-params";
import { PiCaretUp, PiDatabase, PiDatabaseFill, PiDatabaseLight, PiFunnel, PiFunnelFill, PiFunnelLight, PiInfo, PiInfoBold, PiInfoDuotone, PiInfoFill, PiInfoLight, PiListBullets, PiMapPinArea, PiMapPinAreaFill, PiMapPinAreaLight, PiTreeView, PiTreeViewFill, PiTreeViewLight } from "react-icons/pi";
import { SearchContext } from "@/app/search-provider";
import { useContext, useState, useEffect, useTransition } from "react";
import TreeResults from "../search/results/tree-results";
import Facets from "../search/facets/facet-section";
import DatasetDrawer from "../search/datasets/dataset-drawer";
import SearchResults from "../search/results/search-results";
import { useSearchParams, useRouter } from "next/navigation";
import ClientFacet from "../search/facets/client-facet";
import IconButton from "../ui/icon-button";

export default function LeftWindow() {
    const dataset = useDataset()
    const { totalHits } = useContext(SearchContext)
    const { searchFilterParamsString } = useSearchQuery()
    const searchParams = useSearchParams()
    const mode = useMode()
    const nav = searchParams.get('nav') || 'datasets'
    const [windowCollapsed, setWindowCollapsed] = useState(false)
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        const stored = localStorage.getItem('leftWindowCollapsed')
        if (stored !== null) {
            setWindowCollapsed(stored === 'true')
        }
    }, [])

    const isTabActive = (tabName: string) => {
        return nav === tabName && !windowCollapsed && !isPending
    }

    const handleTabClick = (tabName: string) => {
        if (nav === tabName) {
            const newCollapsedState = !windowCollapsed
            localStorage.setItem('leftWindowCollapsed', newCollapsedState.toString())
            setWindowCollapsed(newCollapsedState)
        } else {
            setWindowCollapsed(false)
            startTransition(() => {
                const newParams = new URLSearchParams(searchParams)
                if (tabName === 'datasets') {
                    newParams.delete('nav')
                } 
                else {
                    newParams.set('nav', tabName)
                }
                router.push(`?${newParams.toString()}`, { 
                    scroll: false
                })
                setWindowCollapsed(false)
                localStorage.setItem('leftWindowCollapsed', 'false')
            })
        } 
    }

    return <><div className="flex overflow-x-auto rounded-md p-2 gap-1">
              <IconButton
                      label="Søkevisning"
                      onClick={() => handleTabClick('datasets')}
                      aria-controls="left-window-content"
                      aria-expanded={isTabActive('datasets')}
                      className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-expanded:bg-neutral-100 text-neutral-900 aria-expanded:shadow-inner">
                        {isTabActive('datasets') ? <PiInfoFill className="text-3xl text-accent-800" aria-hidden="true"/> : <PiInfoLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
                </IconButton>
                
                {treeSettings[dataset] ? <IconButton
                      label="Register"
                      onClick={() => handleTabClick('tree')}
                      aria-controls="left-window-content"
                      aria-expanded={isTabActive('tree')}
                      className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-expanded:bg-neutral-100 text-neutral-950 aria-expanded:shadow-inner">
                        {isTabActive('tree') ? <PiTreeViewFill className="text-3xl text-accent-800" aria-hidden="true"/> : <PiTreeViewLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
                </IconButton> : null}

                {contentSettings[dataset].adm ? <IconButton
                      label="Område"
                      onClick={() => handleTabClick('adm')}
                      aria-controls="left-window-content"
                      aria-expanded={isTabActive('adm')}
                      className="flex whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-950 aria-expanded:shadow-inner">
          
                {isTabActive('adm') ? <PiMapPinAreaFill className="text-3xl text-accent-800" aria-hidden="true"/> : <PiMapPinAreaLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
                </IconButton>  : null
                }
                <IconButton
                      label="Filter"
                      onClick={() => handleTabClick('filters')}
                      aria-controls="left-window-content"
                      aria-expanded={isTabActive('filters')}
                      className="flex whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-950 aria-expanded:shadow-inner">
                       {isTabActive('filters') ? <PiFunnelFill className="text-3xl text-accent-800" aria-hidden="true"/> : <PiFunnelLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
                </IconButton>

                {searchFilterParamsString && mode == 'map' && <button 
                      onClick={() => handleTabClick('results')}
                      aria-controls="left-window-content"
                      aria-expanded={isTabActive('results')}
                      className="flex whitespace-nowrap rounded items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 pl-3 pr-2 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-900 aria-expanded:shadow-inner ml-auto">
                        <span className="text-neutral-900 font-semibold uppercase tracking-wider">Treff</span>
                        {isTabActive('results') ? <span className="results-badge bg-accent-800 text-white shadow-sm left-8 rounded-full px-1.5 py-0.5 text-sm whitespace-nowrap">{totalHits && totalHits?.value >= 10000 ? `${Math.round(totalHits.value/1000)}k` : totalHits?.value || '0'}</span>
                        : <span className="results-badge bg-primary-600 text-white shadow-sm left-8 rounded-full px-1.5 py-0.5 text-sm whitespace-nowrap">{totalHits && totalHits?.value >= 10000 ? `${Math.round(totalHits.value/1000)}k` : totalHits?.value || '0'}</span>}
                        
                </button>}

        </div>
        <div id="left-window-content" className={`lg:overflow-y-auto stable-scrollbar px-2 lg:max-h-[calc(100svh-7rem)] py-3 border-t border-neutral-200 ${windowCollapsed || isPending ? "hidden" : ""}`}>
                

        { nav == 'tree' && 
            <TreeResults/>
        }

        
        { nav == 'filters' &&
                <Facets/>
        }
        {
            nav == 'adm' && contentSettings[dataset].adm &&
            <ClientFacet facetName='adm' />
        }
        { searchFilterParamsString && nav == 'results' &&
            <SearchResults/>

        }
        

        
         { nav == 'datasets' &&     
            <DatasetDrawer/>
                
        }
        </div>
        </>
    
}


