import { treeSettings } from "@/config/server-config";
import { useDataset, useSearchQuery } from "@/lib/search-params";
import { PiBinoculars, PiBinocularsFill, PiCaretUp, PiDatabase, PiFunnel, PiFunnelFill, PiListBullets, PiTreeView, PiTreeViewFill, PiX } from "react-icons/pi";
import Clickable from "../ui/clickable/clickable";
import { SearchContext } from "@/app/search-provider";
import { useContext, useState, useEffect, useTransition } from "react";
import { useQueryState } from "nuqs";
import TreeResults from "../search/results/tree-results";
import Facets from "../search/facets/facet-section";
import DatasetDrawer from "../search/datasets/dataset-drawer";
import SearchResults from "../search/results/search-results";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function LeftWindow() {
    const dataset = useDataset()
    const { totalHits, isLoading } = useContext(SearchContext)
    const mode = useQueryState('mode', {defaultValue: 'map'})[0]
    const { searchFilterParamsString } = useSearchQuery()
    const searchParams = useSearchParams()
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
                } else {
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

    return <><div className="flex overflow-x-auto rounded-t-md rounded-md">
              <button
                      onClick={() => handleTabClick('datasets')}
                      aria-controls="left-window-content"
                      aria-expanded={isTabActive('datasets')}
                      className="flex m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-950 aria-expanded:shadow-inner">
                        {isTabActive('datasets') ? <PiCaretUp aria-hidden="true"/>  : <PiDatabase aria-hidden="true"/>}<span className={treeSettings[dataset] ? "sr-only" : "sr-only xl:not-sr-only"}>Datasett</span>
                </button>
                
                {treeSettings[dataset] && <button 
                      onClick={() => handleTabClick('tree')}
                      aria-controls="left-window-content"
                      aria-expanded={isTabActive('tree')}
                      className="flex m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-950 aria-expanded:shadow-inner">
                        {isTabActive('tree') ? <PiCaretUp aria-hidden="true"/>  : <PiTreeView aria-hidden="true"/>}<span className="sr-only">Register</span>
                </button>
                }
                
                        <button 
                      onClick={() => handleTabClick('filters')}
                      aria-controls="left-window-content"
                      aria-expanded={isTabActive('filters')}
                      className={`flex m-1 xl:ml-auto whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-950 aria-expanded:shadow-inner`}>
                       {isTabActive('filters') ? <PiCaretUp aria-hidden="true"/>  : <PiFunnel aria-hidden="true"/>}<span className={"sr-only xl:not-sr-only"}>Avgrens</span>
                </button>

                {searchFilterParamsString && mode == 'map' && <button 
                      onClick={() => handleTabClick('results')}
                      aria-controls="left-window-content"
                      aria-expanded={isTabActive('results')}
                      className={`flex m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-950 aria-expanded:shadow-inner ${treeSettings[dataset] ? "ml-auto xl:ml-0" : ""}`}>
                        {isTabActive('results') ? <PiCaretUp aria-hidden="true"/> : <PiListBullets aria-hidden="true"/>}Treff
                        {isTabActive('results') ? <span className="results-badge bg-accent-800 text-white shadow-sm left-8 rounded-full px-1 text-xs whitespace-nowrap">{totalHits && totalHits?.value >= 10000 ? `${Math.round(totalHits.value/1000)}k` : totalHits?.value || '0'}</span>
                        : <span className="results-badge bg-primary-600 text-white shadow-sm left-8 rounded-full px-1 text-xs whitespace-nowrap">{totalHits?.relation == 'gte' ? '10 000+' : totalHits?.value || '0'}</span>}
                </button>}

        </div>
        <div id="left-window-content" className={`overflow-y-auto stable-scrollbar px-2 max-h-[calc(100svh-6.5rem)] py-3 border-t border-neutral-200 ${windowCollapsed || isPending ? "hidden" : ""}`}>
                

        { nav == 'tree' && 
            <TreeResults/>
        }

        
        { nav == 'filters' &&
                <Facets/>
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


