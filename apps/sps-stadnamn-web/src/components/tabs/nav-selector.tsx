import { treeSettings } from "@/config/server-config";
import { useDataset, useSearchQuery } from "@/lib/search-params";
import { PiDatabase, PiDatabaseFill, PiFunnel, PiFunnelFill, PiListBullets, PiTreeView, PiTreeViewFill } from "react-icons/pi";
import Clickable from "../ui/clickable/clickable";
import { SearchContext } from "@/app/search-provider";
import { useContext } from "react";
import { useQueryState } from "nuqs";

export default function NavSelector({leftSection}: {leftSection: string | null}) {
    const dataset = useDataset()
    const { totalHits, isLoading } = useContext(SearchContext)
    const mode = useQueryState('mode', {defaultValue: 'map'})[0]
    const { searchFilterParamsString } = useSearchQuery()

    return <div className=" flex overflow-x-auto rounded-t-md rounded-md" role="tablist">
              <Clickable aria-selected={leftSection == 'datasets' ? true : false}
                      role="tab"
                      add={{nav: 'datasets'}}
                      className="flex  m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-selected:bg-neutral-100 aria-selected:text-neutral-950 aria-selected:shadow-inner">
                        {leftSection == 'datasets' ? <PiDatabaseFill aria-hidden="true"/>  : <PiDatabase aria-hidden="true"/>}<span className={treeSettings[dataset] ? "sr-only" : "sr-only xl:not-sr-only"}>Datasett</span>
                </Clickable>
                
                {  treeSettings[dataset] && <Clickable aria-selected={leftSection == 'tree' ? true : false}
                        role="tab"
                      add={{nav: 'tree'}}
                      className="flex  m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-selected:bg-neutral-100 aria-selected:text-neutral-950 aria-selected:shadow-inner">
                        {leftSection == 'tree' ? <PiTreeViewFill aria-hidden="true"/>  : <PiTreeView aria-hidden="true"/>}<span className="sr-only">Register</span>
                </Clickable>
                }
                
                <Clickable aria-selected={leftSection == 'filters' ? true : false}
                      role="tab"
                      add={{nav: 'filters'}}
                      className={`flex  m-1 xl:ml-auto whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-selected:bg-neutral-100 aria-selected:text-neutral-950 aria-selected:shadow-inner`}>
                       {leftSection == 'filters' ? <PiFunnelFill aria-hidden="true"/>  : <PiFunnel aria-hidden="true"/>}<span className={ "sr-only xl:not-sr-only"}>Filtre</span>
                </Clickable>

                
                {!isLoading && searchFilterParamsString && mode == 'map' && <Clickable aria-selected={leftSection == 'results' ? true : false}
                      role="tab"
                      add={{nav: 'results'}}
                      className={`flex m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-selected:bg-neutral-100 aria-selected:text-neutral-950 aria-selected:shadow-inner ${treeSettings[dataset] ? "ml-auto xl:ml-0" : ""}`}>
                        <PiListBullets aria-hidden="true"/>Treff
                        {leftSection == 'results' ? <span className="results-badge bg-accent-800 text-white shadow-sm left-8 rounded-full px-1 text-xs whitespace-nowrap">{totalHits?.relation == 'gte' ? '10 000+' : totalHits?.value || '0'}</span>
                        : <span className="results-badge bg-primary-600 text-white shadow-sm left-8 rounded-full px-1 text-xs whitespace-nowrap">{totalHits?.relation == 'gte' ? '10 000+' : totalHits?.value || '0'}</span>}
                </Clickable>}

                



        </div>
    
}


