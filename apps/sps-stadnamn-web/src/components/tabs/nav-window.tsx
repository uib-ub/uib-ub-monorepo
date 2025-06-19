import { contentSettings, treeSettings } from "@/config/server-config";
import { useDataset, useMode, useSearchQuery } from "@/lib/search-params";
import { PiCaretLeft, PiCaretUp, PiDatabase, PiDatabaseFill, PiDatabaseLight, PiFunnel, PiFunnelFill, PiFunnelLight, PiInfo, PiInfoBold, PiInfoDuotone, PiInfoFill, PiInfoLight, PiListBullets, PiMapPinArea, PiMapPinAreaFill, PiMapPinAreaLight, PiTreeView, PiTreeViewFill, PiTreeViewLight, PiX } from "react-icons/pi";
import { SearchContext } from "@/app/search-provider";
import { useContext, useState, useEffect, useTransition } from "react";
import TreeResults from "../search/results/tree-results";
import FacetSection from "../search/facets/facet-section";
import SearchResults from "../search/results/search-results";
import { useSearchParams, useRouter } from "next/navigation";
import ClientFacet from "../search/facets/client-facet";
import IconButton from "../ui/icon-button";
import DatasetInfo from "../search/details/dataset-info";
import Spinner from "../svg/Spinner";
import { formatNumber } from "@/lib/utils";
import DatasetFacet from "../search/facets/dataset-facet";
import ClickableIcon from "../ui/clickable/clickable-icon";
import Link from "next/link";
import Clickable from "../ui/clickable/clickable";

export default function NavWindow() {
    const dataset = useDataset()
    const { totalHits, isLoading } = useContext(SearchContext)
    const { searchFilterParamsString } = useSearchQuery()
    const searchParams = useSearchParams()
    const mode = useMode()
    const nav = searchParams.get('nav')
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const doc = searchParams.get('doc')

    return <><div className={`flex overflow-x-auto rounded-md ${(nav || mode == 'map') ? 'gap-1 p-2' : 'flex-col gap-4 py-4 px-2' }`}>

                {treeSettings[dataset] ? <ClickableIcon
                      label="Hierarki"
                      add={nav !== 'tree' ? {nav: 'tree'} : {}}
                      remove={nav === 'tree' ? ["nav"] : []}
                      aria-controls="nav-window-content"
                      aria-expanded={nav == 'tree'}
                      className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-expanded:bg-neutral-100 text-neutral-950 aria-expanded:shadow-inner">
                        {nav == 'tree' ? <PiTreeViewFill className="text-3xl text-accent-800" aria-hidden="true"/> : <PiTreeViewLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
                </ClickableIcon> : null}

                <ClickableIcon
                      label="Datasett"
                      add={nav !== 'datasets' ? {nav: 'datasets'} : {}}
                      remove={nav === 'datasets' ? ["nav"] : []}
                      aria-expanded={nav == 'datasets'}
                      aria-controls="nav-window-content"
                      className="flex h-10 whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-expanded:bg-neutral-100 text-neutral-950 aria-expanded:shadow-inner">
                        {nav == 'datasets' ? <PiDatabaseFill className="text-3xl text-accent-800" aria-hidden="true"/> : <PiDatabaseLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
                </ClickableIcon>

                {contentSettings[dataset].adm ? <ClickableIcon
                      label="Områdeinndeling"
                      add={nav !== 'adm' ? {nav: 'adm'} : {}}
                      remove={nav === 'adm' ? ["nav"] : []}
                      aria-expanded={nav == 'adm'}
                      aria-controls="nav-window-content"
                      className="flex whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-950 aria-expanded:shadow-inner">
          
                {nav == 'adm' ? <PiMapPinAreaFill className="text-3xl text-accent-800" aria-hidden="true"/> : <PiMapPinAreaLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
                </ClickableIcon>  : null
                }
                <ClickableIcon
                      label="Filter"
                      add={nav !== 'filters' ? {nav: 'filters'} : {}}
                      remove={nav === 'filters' ? ["nav"] : []}
                      aria-expanded={nav == 'filters'}
                      aria-controls="nav-window-content"
                      className="flex whitespace-nowrap rounded items-center basis-1 gap-1 no-underline w-full lg:w-auto p-1 px-2 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-950 aria-expanded:shadow-inner">
                       {nav == 'filters' ? <PiFunnelFill className="text-3xl text-accent-800" aria-hidden="true"/> : <PiFunnelLight className="text-3xl text-neutral-900" aria-hidden="true"/>}
                </ClickableIcon>

                {mode == 'map' && searchFilterParamsString && <Clickable

                      add={nav !== 'results' ? {nav: 'results'} : {}}
                      remove={nav === 'results' ? ["nav"] : []}
                      aria-expanded={nav == 'results'}
                      aria-controls="nav-window-content"
                      className="flex whitespace-nowrap rounded items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 pl-4 pr-3 aria-expanded:bg-neutral-100 aria-expanded:text-neutral-900 aria-expanded:shadow-inner ml-auto">
                        <span className="text-neutral-900 font-semibold uppercase tracking-wider">Treff</span>
                        { isLoading ? <span className=""><Spinner className="text-neutral-900" status="Laster søkeresultat..." /></span> : <>
                        {nav == 'results' ? <span className={`results-badge bg-accent-800 text-white shadow-sm left-8 rounded-full px-1.5 py-0.5 text-sm whitespace-nowrap ${totalHits?.value > 9 ? 'px-1.5': 'px-2'}`}>
                            {totalHits && formatNumber(totalHits.value)}</span>
                        : <span className={`results-badge bg-primary-600 text-white shadow-sm left-8 rounded-full py-0.5 text-sm whitespace-nowrap ${totalHits?.value > 9 ? 'px-1.5': 'px-2'}`}>{totalHits && formatNumber(totalHits.value)}</span>}
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
        <div id="nav-window-content" className={`lg:overflow-y-auto stable-scrollbar px-2 lg:max-h-[calc(100svh-9rem)] py-6 border-t border-neutral-200 ${(!nav || isPending) ? "hidden" : ""}`}>
                

        { nav == 'tree' && 
            <TreeResults/>
        }

        
        { nav == 'filters' &&
                <FacetSection/>
        }
        {
            nav == 'adm' && contentSettings[dataset].adm &&
            <div className="flex flex-col gap-2">
            <h2 className="text-xl px-2 border-b border-neutral-200 pb-2" >
            Områdeinndeling
          </h2>
            <ClientFacet facetName='adm' />
            </div>
        }
        { nav == 'datasets' &&
        <div className="flex flex-col gap-2">
        <h2 className="text-xl px-2 border-b border-neutral-200 pb-2" >
        Datasett
      </h2>
            <DatasetFacet/>
            </div>
        }
        { searchFilterParamsString && nav == 'results' &&
            <SearchResults/>
        }
        { nav == 'datasetInfo' &&     
            <DatasetInfo/>  
        }
        
        </div>
        </>
    
}


