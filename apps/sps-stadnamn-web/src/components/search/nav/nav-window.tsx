import { contentSettings, treeSettings } from "@/config/server-config";
import { usePerspective, useMode, useSearchQuery } from "@/lib/search-params";
import { PiArchiveFill, PiArchiveLight, PiDatabaseFill, PiDatabaseLight, PiFunnelFill, PiFunnelLight, PiMapPinAreaFill, PiMapPinAreaLight, PiTreeViewFill, PiTreeViewLight, PiX } from "react-icons/pi";
import { SearchContext } from "@/app/search-provider";
import { useContext, useTransition } from "react";
import TreeResults from "./results/tree-results";
import FacetSection from "./facets/facet-section";
import SearchResults from "./results/search-results";
import { useSearchParams, useRouter } from "next/navigation";
import ClientFacet from "./facets/client-facet";
import Spinner from "../../svg/Spinner";
import { formatNumber } from "@/lib/utils";
import DatasetFacet from "./facets/dataset-facet";
import ClickableIcon from "../../ui/clickable/clickable-icon";
import Clickable from "../../ui/clickable/clickable";
import WikiAdmFacet from "./facets/wikiAdm-facet";

export default function NavWindow() {
    const perspective = usePerspective()
    const { totalHits, isLoading } = useContext(SearchContext)
    const { searchFilterParamsString } = useSearchQuery()
    const searchParams = useSearchParams()
    const mode = useMode()
    const nav = searchParams.get('nav')
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    return <><div className={`flex overflow-x-auto tabs rounded-md ${(nav || mode == 'map') ? 'gap-1 p-2' : 'flex-col gap-4 py-4 px-2' }`}>

                <Clickable
                    add={nav !== 'datasets' ? {nav: 'datasets'} : {}}
                    remove={nav === 'datasets' ? ["nav"] : []}
                    aria-expanded={nav == 'datasets' || nav == 'tree'}
                    aria-controls="nav-window-content"
                    className="flex h-10 whitespace-nowrap items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 pr-4 pl-3">
                        {nav == 'datasets' ? <PiDatabaseFill className="text-lg text-accent-800" aria-hidden="true"/> : <PiDatabaseLight className="text-lg text-neutral-900" aria-hidden="true"/>}
                        <span className="text-neutral-900 sr-only 2xl:not-sr-only whitespace-nowrap">Datasett</span>
                </Clickable>            
                <Clickable
                      add={nav !== 'filters' ? {nav: 'filters'} : {}}
                      remove={nav === 'filters' ? ["nav"] : []}
                      aria-expanded={nav == 'filters'}
                      aria-controls="nav-window-content"
                      className="flex whitespace-nowrap items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 pr-4 pl-3">
                       {nav == 'filters' ? <PiFunnelFill className="text-lg text-accent-800" aria-hidden="true"/> : <PiFunnelLight className="text-lg text-neutral-900" aria-hidden="true"/>}
                       <span className="text-neutral-900 sr-only 2xl:not-sr-only whitespace-nowrap">Filter</span>
                </Clickable>

                {mode == 'map' && searchFilterParamsString && <Clickable

                      add={nav !== 'results' ? {nav: 'results'} : {}}
                      remove={nav === 'results' ? ["nav"] : []}
                      aria-expanded={nav == 'results'}
                      aria-controls="nav-window-content"
                      className="flex whitespace-nowrap  items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 pl-4 pr-3 ml-auto">
                        <span className="text-neutral-900">Treff</span>
                        { isLoading ? <span className=""><Spinner className="text-neutral-900" status="Laster søkeresultat..." /></span> : <>
                        {nav == 'results' ? <span className={`results-badge bg-accent-800 font-bold text-white shadow-sm left-8 rounded-full px-1.5 py-0.5 text-sm whitespace-nowrap ${totalHits?.value > 9 ? 'px-1.5': 'px-2'}`}>
                            {totalHits && formatNumber(totalHits.value)}</span>
                        : <span className={`results-badge text-primary-700 bg-primary-200 font-bold left-8 rounded-full py-0.5 text-sm whitespace-nowrap ${totalHits?.value > 9 ? 'px-1.5': 'px-2'}`}>{totalHits && formatNumber(totalHits.value)}</span>}
                        </>}
                </Clickable>
                }
                
                


                {(nav && mode != 'map') && <ClickableIcon
                      label="Lukk"
                      remove={["nav"]}
                      className="ml-auto">
                      <PiX aria-hidden="true" className="text-3xl text-neutral-900"/>
                </ClickableIcon>}

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
        { searchFilterParamsString && nav == 'results' &&
            <SearchResults/>
        }
        
        </div>
        </>
    
}


