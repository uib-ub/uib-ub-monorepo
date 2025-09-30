'use client'

import { PiBookOpen, PiGpsFix, PiStackPlus } from "react-icons/pi";
import { RoundButton, RoundIconButton } from "../ui/clickable/round-icon-button";
import dynamic from "next/dynamic";
import { formatNumber } from "@/lib/utils";
import ResultExplorer from "./nav/results/result-explorer";
import SearchResults from "./nav/results/search-results";
import DocInfo from "./details/doc/doc-info";
import { datasetTitles } from "@/config/metadata-config";
import CadastreBreadcrumb from "./details/doc/cadastre-breadcrumb";
import TreeList from "./nav/tree-list";
import MapSettings from "../map/map-settings";
import DatasetFacet from "./nav/facets/dataset-facet";
import FacetSection from "./nav/facets/facet-section";
import ActiveFilters from "./form/active-filters";
import { useSessionStore } from "@/state/zustand/session-store";
import { useMode } from "@/lib/param-hooks";
import { useContext, useRef } from "react";
import useGroupData from "@/state/hooks/group-data";
import { useSearchQuery } from "@/lib/search-params";
import { GlobalContext } from "@/state/providers/global-provider";
import useSearchData from "@/state/hooks/search-data";
import { useSearchParams } from "next/navigation";
import { getMyLocation } from "@/lib/map-utils";

const Drawer = dynamic(() => import("../ui/drawer"), {
    ssr: false
});

export default function OverlayInterface() {

    

    const drawerContent = useSessionStore((s) => s.drawerContent);
    const setDrawerContent = useSessionStore((s) => s.setDrawerContent);

    const snappedPosition = useSessionStore((s) => s.snappedPosition);
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition);

    const currentPosition = useSessionStore((s) => s.currentPosition);
    const setCurrentPosition = useSessionStore((s) => s.setCurrentPosition);

    const drawerOpen = useSessionStore((s) => s.drawerOpen);
    const setDrawerOpen = useSessionStore((s) => s.setDrawerOpen);



    const searchParams = useSearchParams()
    const adm2 = searchParams.get('adm2')
    const adm1 = searchParams.get('adm1')
    const dataset = searchParams.get('dataset')
    const { mapFunctionRef } = useContext(GlobalContext)

    const doc = searchParams.get('doc')
    const { searchFilterParamsString, facetFilters } = useSearchQuery()
    const { totalHits } = useSearchData()
    const mode = useMode()
    const { groupData } = useGroupData()
    const group = searchParams.get('group')

    const datasetTag = searchParams.get('datasetTag')

    const drawerRef = useRef<HTMLDivElement>(null)

    const scrollableContent = useRef<HTMLDivElement>(null);

    const results = searchParams.get('results') == 'on'
    const options = searchParams.get('options') == 'on'
    const mapOptions = searchParams.get('mapOptions') == 'on'
    const { isMobile } = useContext(GlobalContext)



    const toggleDrawer = (tab: string) => {
        setDrawerContent(tab == drawerContent ? null : tab)
    }



 


    return <>
        {snappedPosition !== 'max' && <>
   
            <div className="absolute flex gap-2 left-4 z-[4000] h-12"
                style={{ bottom: drawerOpen ? `calc(${currentPosition}rem + +.5rem)` : '2rem' }}
            >
                {drawerContent != 'results' && <RoundButton
                    className="pl-4"
                    onClick={() => toggleDrawer('details')}
                >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                        {!searchFilterParamsString && <PiBookOpen className="text-xl" aria-hidden="true" />}
                        {searchFilterParamsString && totalHits && totalHits.value > 0 ?
                            <span className="space-x-1">
                                <span className="uppercase tracking-wider font-semibold">Treff</span>
                                <span className="results-badge text-primary-700 bg-primary-200 font-bold left-8 rounded-full py-0.5 text-sm whitespace-nowrap px-1.5">
                                    {formatNumber(totalHits.value)}</span></span> : <span>{groupData?.label}</span>}
                    </span>
                </RoundButton>}
            </div>
        </>}

        <div ref={drawerRef}  className="scroll-container">
                <Drawer 
                    drawerOpen={drawerOpen}
                    setDrawerOpen={setDrawerOpen}
                    snappedPosition={snappedPosition}
                    setSnappedPosition={setSnappedPosition}
                    currentPosition={currentPosition}
                    setCurrentPosition={setCurrentPosition}
                    scrollContainerRef={scrollableContent}
                >
                    <div className="h-full bg-white xl:overflow-y-auto flex flex-col pb-20 lg:absolute left-2 lg:top-[4rem] lg:w-[calc(25svw-1rem)] lg:max-h-[calc(100svh-8rem)] lg:max-w-[40svw]  shadow-lg rounded-b-md lg:rounded-md">
                        {results && <ResultExplorer/>}
                        {drawerContent == 'tree' &&
                            <section className="flex flex-col gap-2 p-2">

                                <h2 className="text-neutral-900 text-xl px-2">
                                    {adm2 ? adm2 : adm1 ? adm1 : datasetTitles[dataset || '']}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 p-2"><CadastreBreadcrumb /></div>
                                <TreeList />
                            </section>
                        }
                    </div>
                    <div className="h-full bg-white flex flex-col pb-20">

                        {
                            drawerContent == 'mapSettings' &&
                            <div className="p-2">
                                <h2 className="text-xl px-1">
                                    Kartinnstillingar
                                </h2>
                                <MapSettings />
                            </div>
                        }
                        {drawerContent == 'filters' &&
                            <div className="p-2">
                                <h2 className="text-xl px-1">Søkealternativ {facetFilters.length > 0 && <span className="results-badge bg-primary-500 left-8 rounded-full px-1 text-white text-xs whitespace-nowrap">{facetFilters.length}</span>}</h2>
                                <div className="flex flex-wrap gap-2 py-2"><ActiveFilters /></div>
                                <FacetSection />
                            </div>

                        }
                    </div>
                </Drawer>
            </div>
    </>

}