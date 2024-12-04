import { treeSettings } from "@/config/server-config";
import { useDataset, useSearchQuery } from "@/lib/search-params";
import { PiDatabase, PiDatabaseFill, PiFunnel, PiFunnelFill, PiListBullets, PiTreeView, PiTreeViewFill } from "react-icons/pi";
import SearchLink from "../ui/search-link";
import { SearchContext } from "@/app/search-provider";
import { use, useContext } from "react";
import { useQueryState } from "nuqs";

export default function NavSelector({expandedSection}: {expandedSection: string | null}) {
    const dataset = useDataset()
    const { totalHits, isLoading } = useContext(SearchContext)
    const mode = useQueryState('mode', {defaultValue: 'map'})[0]
    const { searchFilterParamsString } = useSearchQuery()

    return <nav className=" flex overflow-x-auto rounded-t-md rounded-md">
              <SearchLink aria-current={expandedSection == 'datasets' ? 'page' : false}
                      add={{expanded: 'datasets'}}
                      className="flex  m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-neutral-100 aria-[current=page]:text-neutral-950 aria-[current=page]:shadow-inner">
                        {expandedSection == 'datasets' ? <PiDatabaseFill aria-hidden="true"/>  : <PiDatabase aria-hidden="true"/>}Datasett
                </SearchLink>
                
                {  treeSettings[dataset] && <SearchLink aria-current={expandedSection == 'tree' ? 'page' : false}
                      add={{expanded: 'tree'}}
                      className="flex  m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-neutral-100 aria-[current=page]:text-neutral-950 aria-[current=page]:shadow-inner">
                        {expandedSection == 'tree' ? <PiTreeViewFill aria-hidden="true"/>  : <PiTreeView aria-hidden="true"/>}<span className="sr-only 2xl:not-sr-only">Register</span>
                </SearchLink>
                }
                
                <SearchLink aria-current={expandedSection == 'filters' ? 'page' : false}
                      add={{expanded: 'filters'}}
                      className="flex  m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-neutral-100 aria-[current=page]:text-neutral-950 aria-[current=page]:shadow-inner">
                       {expandedSection == 'filters' ? <PiFunnelFill aria-hidden="true"/>  : <PiFunnel aria-hidden="true"/>}Filtre
                </SearchLink>

                
                {!isLoading && searchFilterParamsString && expandedSection != 'tree' && mode != 'table' && <SearchLink aria-current={expandedSection == 'results' ? 'page' : false}
                      add={{expanded: 'results'}}
                      className="flex ml-auto m-1 whitespace-nowrap rounded-md items-center basis-1 gap-1 no-underline w-full p-2 px-4 lg:w-auto lg:p-1 lg:px-2 aria-[current=page]:bg-neutral-100 aria-[current=page]:text-neutral-950 aria-[current=page]:shadow-inner">
                        <PiListBullets aria-hidden="true"/>Treff
                        {expandedSection == 'results' ? <span className="results-badge bg-accent-700 text-white shadow-sm left-8 rounded-full px-1 text-xs whitespace-nowrap">{totalHits?.relation == 'gte' ? '10 000+' : totalHits?.value || '0'}</span>
                        : <span className="results-badge bg-primary-600 text-white shadow-sm left-8 rounded-full px-1 text-xs whitespace-nowrap">{totalHits?.relation == 'gte' ? '10 000+' : totalHits?.value || '0'}</span>}
                </SearchLink>}

                



        </nav>
    
}


