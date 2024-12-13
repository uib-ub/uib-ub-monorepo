import { treeSettings } from "@/config/server-config";
import { useDataset, useSearchQuery } from "@/lib/search-params";
import { PiDatabase, PiDatabaseFill, PiFunnel, PiFunnelFill, PiListBullets, PiTreeView, PiTreeViewFill } from "react-icons/pi";
import SearchLink from "../ui/search-link";
import { SearchContext } from "@/app/search-provider";
import { useContext } from "react";
import { useQueryState } from "nuqs";

export default function NavSelector({leftSection}: {leftSection: string | null}) {
    const dataset = useDataset()
    const { totalHits, isLoading } = useContext(SearchContext)
    const mode = useQueryState('mode', {defaultValue: 'map'})[0]
    const { searchFilterParamsString } = useSearchQuery()

    return <nav className=" flex overflow-x-auto rounded-t-md rounded-md">
              <SearchLink aria-current={leftSection == 'datasets' ? 'page' : false}
                      add={{nav: 'datasets'}}
                      className="flex  m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-neutral-100 aria-[current=page]:text-neutral-950 aria-[current=page]:shadow-inner">
                        {leftSection == 'datasets' ? <PiDatabaseFill aria-hidden="true"/>  : <PiDatabase aria-hidden="true"/>}<span className={treeSettings[dataset] ? "sr-only" : "sr-only xl:not-sr-only"}>Datasett</span>
                </SearchLink>
                
                {  treeSettings[dataset] && <SearchLink aria-current={leftSection == 'tree' ? 'page' : false}
                      add={{nav: 'tree'}}
                      className="flex  m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-neutral-100 aria-[current=page]:text-neutral-950 aria-[current=page]:shadow-inner">
                        {leftSection == 'tree' ? <PiTreeViewFill aria-hidden="true"/>  : <PiTreeView aria-hidden="true"/>}<span className="sr-only">Register</span>
                </SearchLink>
                }
                
                <SearchLink aria-current={leftSection == 'filters' ? 'page' : false}
                      add={{nav: 'filters'}}
                      className={`flex  m-1 xl:ml-auto whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-neutral-100 aria-[current=page]:text-neutral-950 aria-[current=page]:shadow-inner`}>
                       {leftSection == 'filters' ? <PiFunnelFill aria-hidden="true"/>  : <PiFunnel aria-hidden="true"/>}<span className={ "sr-only xl:not-sr-only"}>Filtre</span>
                </SearchLink>

                
                {!isLoading && searchFilterParamsString && mode != 'table' && <SearchLink aria-current={leftSection == 'results' ? 'page' : false}
                      add={{nav: 'results'}}
                      className={`flex m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-neutral-100 aria-[current=page]:text-neutral-950 aria-[current=page]:shadow-inner ${treeSettings[dataset] ? "ml-auto xl:ml-0" : ""}`}>
                        <PiListBullets aria-hidden="true"/>Treff
                        {leftSection == 'results' ? <span className="results-badge bg-accent-700 text-white shadow-sm left-8 rounded-full px-1 text-xs whitespace-nowrap">{totalHits?.relation == 'gte' ? '10 000+' : totalHits?.value || '0'}</span>
                        : <span className="results-badge bg-primary-600 text-white shadow-sm left-8 rounded-full px-1 text-xs whitespace-nowrap">{totalHits?.relation == 'gte' ? '10 000+' : totalHits?.value || '0'}</span>}
                </SearchLink>}

                



        </nav>
    
}


