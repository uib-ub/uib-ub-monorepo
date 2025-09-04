import { useMode } from '@/lib/param-hooks';
import { PiArchiveFill, PiArchiveLight, PiDatabaseFill, PiDatabaseLight, PiFunnelFill, PiFunnelLight } from "react-icons/pi";
import { useTransition } from "react";
import FacetSection from "./facets/facet-section";
import SearchResults from "./results/search-results";
import { useSearchParams } from "next/navigation";
import Spinner from "../../svg/Spinner";
import { formatNumber } from "@/lib/utils";
import DatasetFacet from "./facets/dataset-facet";
import Clickable from "../../ui/clickable/clickable";
import TableOptions from "../table/table-options";
import useSearchData from "@/state/hooks/search-data";

export default function NavWindow() {
    const { totalHits, searchLoading } = useSearchData()
    const searchParams = useSearchParams()
    const mode = useMode()
    const nav = searchParams.get('nav')
    const [isPending, startTransition] = useTransition()


    return <><div className={`flex overflow-x-auto tabs rounded-md gap-1 p-2`}>

                <Clickable
                    add={nav !== 'datasets' ? {nav: 'datasets'} : {}}
                    remove={nav === 'datasets' ? ["nav"] : []}
                    aria-expanded={nav == 'datasets' || nav == 'tree'}
                    aria-controls="nav-window-content"
                    className="flex h-10 whitespace-nowrap items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 pr-4 pl-3">
                        {nav == 'datasets' ? <PiDatabaseFill className="text-lg text-accent-800" aria-hidden="true"/> : <PiDatabaseLight className="text-lg text-neutral-900" aria-hidden="true"/>}
                        <span className="sr-only 2xl:not-sr-only whitespace-nowrap">Datasett</span>
                </Clickable>            
                <Clickable
                      add={nav !== 'filters' ? {nav: 'filters'} : {}}
                      remove={nav === 'filters' ? ["nav"] : []}
                      aria-expanded={nav == 'filters'}
                      aria-controls="nav-window-content"
                      className="flex whitespace-nowrap items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 pr-4 pl-3">
                       {nav == 'filters' ? <PiFunnelFill className="text-lg text-accent-800" aria-hidden="true"/> : <PiFunnelLight className="text-lg text-neutral-900" aria-hidden="true"/>}
                       <span className="sr-only 2xl:not-sr-only whitespace-nowrap">Filter</span>
                </Clickable>

                <Clickable

                      add={nav !== 'results' ? {nav: 'results'} : {}}
                      remove={nav === 'results' ? ["nav"] : []}
                      aria-expanded={nav == 'results'}
                      aria-controls="nav-window-content"
                      className="flex whitespace-nowrap  items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 pl-4 pr-3 ml-auto">
                        Treff
                        { searchLoading ? <span className=""><Spinner className="text-neutral-900" status="Laster søkeresultat..." /></span> : <>
                        {nav == 'results' ? <span className={`results-badge bg-accent-800 font-bold text-white shadow-sm left-8 rounded-full px-1.5 py-0.5 text-sm whitespace-nowrap ${totalHits?.value > 9 ? 'px-1.5': 'px-2'}`}>
                            {totalHits && formatNumber(totalHits.value)}</span>
                        : <span className={`results-badge text-primary-700 bg-primary-200 font-bold left-8 rounded-full py-0.5 text-sm whitespace-nowrap ${totalHits?.value > 9 ? 'px-1.5': 'px-2'}`}>{totalHits && formatNumber(totalHits.value)}</span>}
                        </>}
                </Clickable>
                
                




        </div>
        <div id="nav-window-content" className={`overflow-y-auto stable-scrollbar px-2 max-h-[calc(100svh-11rem)] xl:max-h-[calc(100svh-8.5rem)] py-6 border-t border-neutral-200 ${(!nav || isPending) ? "hidden" : ""}`}>
                



        
        { nav == 'filters' &&
                <FacetSection/>
        }
        { (nav == 'datasets' || nav == 'tree') &&
        <div className="flex flex-col gap-2">
        <h2 className="text-xl px-2" >
        Datasett
      </h2>
            <DatasetFacet/>
            </div>
        }
        { nav == 'results' && mode != 'table' &&
            <SearchResults/>
        }



        { nav == 'results' && mode == 'table' && <>
        <h2 className="text-xl px-1">Tabellvisning</h2>
        <p className="px-1">Tabellvisning viser søkeresultat utan gruppering</p>
        <TableOptions/>

        </>
          
        }
        
        </div>
        </>
    
}


