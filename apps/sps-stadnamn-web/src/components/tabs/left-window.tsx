import { treeSettings } from "@/config/server-config";
import { useDataset, useSearchQuery } from "@/lib/search-params";
import { PiBinoculars, PiBinocularsFill, PiFunnel, PiFunnelFill, PiListBullets, PiTreeView, PiTreeViewFill, PiX } from "react-icons/pi";
import Clickable from "../ui/clickable/clickable";
import { SearchContext } from "@/app/search-provider";
import { useContext } from "react";
import { useQueryState } from "nuqs";
import TreeResults from "../search/results/tree-results";
import Facets from "../search/facets/facet-section";
import DatasetDrawer from "../search/datasets/dataset-drawer";
import SearchResults from "../search/results/search-results";
import { useSearchParams } from "next/navigation";

export default function LeftWindow() {
    const dataset = useDataset()
    const { totalHits, isLoading } = useContext(SearchContext)
    const mode = useQueryState('mode', {defaultValue: 'map'})[0]
    const { searchFilterParamsString } = useSearchQuery()
    const searchParams = useSearchParams()
    const nav = searchParams.get('nav')

    return <><div className=" flex overflow-x-auto rounded-t-md rounded-md">
              <Clickable
                      {...nav == 'datasets' ? {remove: ['nav']} : {add: {nav: 'datasets'}}}
                      aria-expanded={nav == 'datasets'}
                      className="flex  m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-950 aria-expanded:shadow-inner">
                        {nav == 'datasets' ? <PiX aria-hidden="true"/>  : <PiBinoculars aria-hidden="true"/>}<span className={treeSettings[dataset] ? "sr-only" : "sr-only xl:not-sr-only"}>Perspektiv</span>
                </Clickable>
                
                {  treeSettings[dataset] && <Clickable aria-expanded={nav == 'tree'}
                      {...nav == 'tree' ? {remove: ['nav']} : {add: {nav: 'tree'}}}
                      className="flex  m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-950 aria-expanded:shadow-inner">
                        {nav == 'tree' ? <PiX aria-hidden="true"/>  : <PiTreeView aria-hidden="true"/>}<span className="sr-only">Register</span>
                </Clickable>
                }
                
                <Clickable aria-expanded={nav == 'filters'}
                      {...nav == 'filters' ? {remove: ['nav']} : {add: {nav: 'filters'}}}
                      className={`flex  m-1 xl:ml-auto whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-950 aria-expanded:shadow-inner`}>
                       {nav == 'filters' ? <PiX aria-hidden="true"/>  : <PiFunnel aria-hidden="true"/>}<span className={ "sr-only xl:not-sr-only"}>Filtre</span>
                </Clickable>

                
                {!isLoading && searchFilterParamsString && mode == 'map' && <Clickable aria-expanded={nav == 'results'}
                      {...nav == 'results' ? {remove: ['nav']} : {add: {nav: 'results'}}}
                      className={`flex m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-950 aria-expanded:shadow-inner ${treeSettings[dataset] ? "ml-auto xl:ml-0" : ""}`}>
                        <PiListBullets aria-hidden="true"/>Treff
                        {nav == 'results' ? <span className="results-badge bg-accent-800 text-white shadow-sm left-8 rounded-full px-1 text-xs whitespace-nowrap">{totalHits?.relation == 'gte' ? '10 000+' : totalHits?.value || '0'}</span>
                        : <span className="results-badge bg-primary-600 text-white shadow-sm left-8 rounded-full px-1 text-xs whitespace-nowrap">{totalHits?.relation == 'gte' ? '10 000+' : totalHits?.value || '0'}</span>}
                </Clickable>}

        </div>
        <div className={`overflow-y-auto stable-scrollbar px-2 max-h-[calc(100svh-6.5rem)] py-3 border-t border-neutral-200 ${nav ? "" : "hidden"}`}>

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


