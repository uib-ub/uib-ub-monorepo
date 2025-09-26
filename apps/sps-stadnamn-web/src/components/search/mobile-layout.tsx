'use client'
import { useContext, useEffect, useRef, useState } from "react"
import { PiBookOpen, PiCaretRightBold, PiGpsFix, PiStackPlus } from "react-icons/pi";
import SearchResults from "./nav/results/search-results";
import { useSearchQuery } from "@/lib/search-params";
import StatusSection from "./status-section";
import TableExplorer from "./table/table-explorer";
import { useSearchParams } from "next/navigation";
import ListExplorer from "./list/list-explorer";
import DocInfo from "./details/doc/doc-info";
import FacetSection from "./nav/facets/facet-section";
import ActiveFilters from "./form/active-filters";
import { formatNumber } from "@/lib/utils";
import DatasetFacet from "./nav/facets/dataset-facet";
import Clickable from "../ui/clickable/clickable";
import NamesExplorer from "./names/names-explorer";
import InfoPopover from "../ui/info-popover";
import useGroupData from "@/state/hooks/group-data";
import MapWrapper from "../map/map-wrapper";
import useSearchData from "@/state/hooks/search-data";
import { useMode } from "@/lib/param-hooks"
import TreeList from "./nav/tree-list";
import { datasetTitles } from "@/config/metadata-config";
import CadastreBreadcrumb from "./details/doc/cadastre-breadcrumb";
import ClickableIcon from "../ui/clickable/clickable-icon";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import { getMyLocation } from "@/lib/map-utils";
import MapSettings from "../map/map-settings";
import Drawer from "@/components/ui/drawer";
import { RoundButton, RoundIconButton } from "../ui/clickable/round-icon-button";

export default function MobileLayout() {

    const drawerContent = useSessionStore((s) => s.drawerContent);
    const setDrawerContent = useSessionStore((s) => s.setDrawerContent);

    const snappedPosition = useSessionStore((s) => s.snappedPosition);
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition);

    const currentPosition = useSessionStore((s) => s.currentPosition);
    const setCurrentPosition = useSessionStore((s) => s.setCurrentPosition);

    const setMyLocation = useSessionStore((s) => s.setMyLocation);

    const searchParams = useSearchParams()
    const adm2 = searchParams.get('adm2')
    const adm1 = searchParams.get('adm1')
    const dataset = searchParams.get('dataset')
    const { mapFunctionRef } = useContext(GlobalContext)

    const nav = searchParams.get('nav')

    const doc = searchParams.get('doc')
    const { searchFilterParamsString, facetFilters } = useSearchQuery()
    const { totalHits, searchLoading } = useSearchData()
    const [facetIsLoading, setFacetIsLoading] = useState(false)
    const [showLoading, setShowLoading] = useState<boolean>(false)
    const mode = useMode()
    const datasetCount = searchParams.getAll('dataset')?.length || 0
    const { groupTotal, groupLabel, groupLoading, groupDoc } = useGroupData()
    const group = searchParams.get('group')

    const datasetTag = searchParams.get('datasetTag')

    const drawerRef = useRef<HTMLDivElement>(null)
    const details = searchParams.get('details')

    const scrollableContent = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!searchLoading && !facetIsLoading) {
            setTimeout(() => {
                setShowLoading(false)
            }, 100);
        }
        else {
            setShowLoading(true)
        }
    }
        , [searchLoading, facetIsLoading])


    const toggleDrawer = (tab: string) => {
        setDrawerContent(tab == drawerContent ? null : tab)
    }

    const drawerOpen = !!drawerContent;

    return <>
        {(snappedPosition !== 'max' || !drawerContent) && <>
            {mode == 'map' && <div className="absolute flex gap-2 top-[4.5rem] right-4 z-[4000]">
                <RoundIconButton
                    label="Min posisjon"
                    onClick={() => { setDrawerContent('mapSettings'); setSnappedPosition('max') }}
                >
                    <PiStackPlus className="text-2xl" aria-hidden="true" />
                </RoundIconButton>
            </div>}
            <div className="absolute flex gap-2 right-4 z-[4000]"
                style={{ bottom: drawerOpen ? `calc(${currentPosition}rem + +.5rem)` : '2rem' }}
            >
                {drawerContent != 'details' && <RoundButton
                    className="pl-4"
                    onClick={() => toggleDrawer('details')}
                >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                        {!searchFilterParamsString && <PiBookOpen className="text-xl" aria-hidden="true" />}
                        {searchFilterParamsString && totalHits && totalHits.value > 0 ?
                            <span className="space-x-1">
                                <span className="uppercase tracking-wider font-semibold">Treff</span>
                                <span className="results-badge text-primary-700 bg-primary-200 font-bold left-8 rounded-full py-0.5 text-sm whitespace-nowrap px-1.5">
                                    {formatNumber(totalHits.value)}</span></span> : <span>{groupDoc?._source?.label}</span>}
                    </span>
                </RoundButton>}
                {mode == 'map' && <RoundIconButton
                    label="Min posisjon"
                    onClick={() => {
                        getMyLocation((location) => {
                            mapFunctionRef?.current?.setView(location, 15)
                            setMyLocation(location)
                        });
                    }}
                >
                    <PiGpsFix className="text-2xl" aria-hidden="true" />
                </RoundIconButton>}
            </div>
        </>}

        <div className="scroll-container">

            <div ref={drawerRef} className="mobile-interface">
                <Drawer
                    drawerOpen={drawerOpen}
                    setDrawerOpen={(open) => { if (!open) setDrawerContent(null); }}
                    snappedPosition={snappedPosition}
                    currentPosition={currentPosition}
                    setSnappedPosition={setSnappedPosition}
                    setCurrentPosition={setCurrentPosition}
                    scrollContainerRef={scrollableContent}
                >
                    <div className="h-full bg-white flex flex-col pb-20">
                        {drawerContent == 'details' && <>
                            {group && !doc && <div className="pb-24">
                                <ListExplorer />
                                {groupDoc?._source?.location && <Clickable className="px-3 bg-neutral-50 text-xl border-y border-neutral-200 w-full mt-4 aria-[current=true]:btn-accent flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-12" add={{ details: 'overview', namesScope: 'extended' }}>

                                    Finn liknande namn<PiCaretRightBold className="text-primary-600" aria-hidden="true" />
                                </Clickable>}
                            </div>}
                            {doc && <div className="pb-24 p-2"><DocInfo /></div>}
                            {false && details && details != 'group' && !doc &&
                                <div className="pb-12 pt-2 px-2">
                                    <span className="flex items-center pb-2 text-xl"><h2 className="text-neutral-800 text-xl tracking-wide flex items-center gap-1 ">{groupLabel}</h2>
                                        <InfoPopover>
                                            Utvida oversikt over liknande oppslag i nærområdet. Treffa er ikkje nødvendigvis former av namnet du har valt, og det kan vere namnformer som ikkje kjem med.
                                        </InfoPopover></span>
                                    <NamesExplorer />
                                </div>
                            }


                        </>}
                        {drawerContent == 'tree' &&
                            <section className="flex flex-col gap-2 p-2">

                                <h2 className="text-neutral-900 text-xl px-2">
                                    {adm2 ? adm2 : adm1 ? adm1 : datasetTitles[dataset || '']}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 p-2"><CadastreBreadcrumb /></div>
                                <TreeList />
                            </section>
                        }
                        {
                            drawerContent == 'mapSettings' &&
                            <div className="p-2">
                                <h2 className="text-xl px-1">
                                    Kartinnstillingar
                                </h2>
                                <MapSettings />
                            </div>
                        }
                        {false && drawerContent == 'results' && datasetTag != 'tree' &&
                            <section className="flex flex-col gap-2 p-2">
                                <h2 className="text-2xl px-1">
                                    Treff <span className={`results-badge bg-primary-500 left-8 rounded-full text-white text-xs whitespace-nowrap ${totalHits && totalHits.value < 10 ? 'px-1.5' : 'px-1'}`}>
                                        {totalHits && formatNumber(totalHits.value)}
                                    </span>
                                </h2>
                                {(searchParams.get('q') || searchParams.get('fulltext') == 'on') && <div className="flex gap-2 pb-2 border-b border-neutral-200">
                                    <ActiveFilters />
                                </div>}

                                <SearchResults />
                            </section>

                        }
                        {(drawerContent == 'datasets') &&
                            <div className="p-2">
                                <h2 className="text-xl px-1">
                                    {datasetTag == 'tree' && 'Registre'}
                                    {datasetTag == 'base' && 'Grunnord'}
                                    {datasetTag == 'deep' && 'Djupinnsamlingar'}
                                    {!datasetTag && 'Datasett'}
                                </h2>

                                <DatasetFacet />
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

            <div className={`absolute top-14 m-4 left-0 z-[1000] ${mode == 'map' ? '' : 'max-h-[calc(100svh-3rem)] overflow-auto bg-neutral-50 !m-0 h-full w-full stable-scrollbar'}`}>
                <StatusSection />
                {mode == 'table' && <TableExplorer />}
                {mode == 'list' && <ListExplorer />}
                {doc && mode == 'doc' && <DocInfo />}
            </div>

            {mode == 'map' && <div className="absolute right-0 bottom-0 top-14 max-h-[calc(100svh-3.5rem)] w-full bg-white rounded-md">
                <MapWrapper />

            </div>}





        </div>
    </>
}