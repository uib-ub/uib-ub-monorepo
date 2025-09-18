'use client'
import { useContext, useEffect, useRef, useState } from "react"
import { PiBinocularsFill, PiBookOpen, PiCaretRightBold, PiDatabase, PiFunnel, PiGpsFix, PiListBullets, PiSliders, PiStackPlus, PiTreeViewFill } from "react-icons/pi";
import SearchResults from "./nav/results/search-results";
import { useSearchQuery } from "@/lib/search-params";
import StatusSection from "./status-section";
import TreeResults from "./nav/results/tree-results";
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
import useDocData from "@/state/hooks/doc-data";
import useGroupData from "@/state/hooks/group-data";
import MapWrapper from "../map/map-wrapper";
import useSearchData from "@/state/hooks/search-data";
import MobileSearchNav from "./details/doc/mobile-search-nav";
import { useMode } from "@/lib/param-hooks"
import TreeWindow from "./nav/tree-list";
import TreeList from "./nav/tree-list";
import { datasetTitles } from "@/config/metadata-config";
import CadastreBreadcrumb from "./details/doc/cadastre-breadcrumb";
import ClickableIcon from "../ui/clickable/clickable-icon";
import { GlobalContext } from "@/app/global-provider";

export default function MobileLayout() {
    const [currentPosition, setCurrentPosition] = useState(30);
    const [snappedPosition, setSnappedPosition] = useState(30);
    const [snapped, setSnapped] = useState(false);
    const [startTouchY, setStartTouchY] = useState(0);
    const [startTouchX, setStartTouchX] = useState(0);
    const [drawerSwipeDirection, setDrawerSwipeDirection] = useState<null | 'up' | 'down'>(null);
    const scrollableContent = useRef<HTMLDivElement>(null);
    const [startTouchTime, setStartTouchTime] = useState<number>(0);
    const searchParams = useSearchParams()
    const adm2 = searchParams.get('adm2')
    const adm1 = searchParams.get('adm1')
    const dataset = searchParams.get('dataset')
    const { mapFunctionRef } = useContext(GlobalContext)

    const [drawerContent, setDrawerContent] = useState<string | null>(null)
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
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const drawerRef = useRef<HTMLDivElement>(null)
    const mobileNav = useRef<HTMLDivElement>(null)
    const details = searchParams.get('details')

    const [showScrollToTop, setShowScrollToTop] = useState(false);

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

    const isScrolling = (target: EventTarget) => {
        if (snappedPosition == 60 && target instanceof Node && scrollableContent.current?.contains(target)) {
            return scrollableContent.current.scrollTop != 0
    }
    }

    const isScrollable = () => {
        if (scrollableContent.current) {
            return scrollableContent.current.scrollHeight > scrollableContent.current.clientHeight;
        }
        return false;
    }

    const pos2svh = (yPos: number) => {
        const windowHeight = window.visualViewport?.height || window.innerHeight;
        return (windowHeight - yPos) / windowHeight * 60
    }

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.target && isScrolling(e.target)) {
            return
        }

        setStartTouchY(e.touches[0].clientY);
        setStartTouchX(e.touches[0].clientX);
        setStartTouchTime(Date.now());
        setSnapped(false);
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        setSnapped(true);

        const endTouchY = e.changedTouches[0].clientY;
        const endTouchX = e.changedTouches[0].clientX;
        const endTouchTime = Date.now();
        const touchDuration = endTouchTime - startTouchTime;
        const swipeDistance = startTouchY - endTouchY;
        const isQuickSwipe = touchDuration < 400;

        const isHorizontalSwipe = Math.abs(startTouchX - endTouchX) > Math.abs(startTouchY - endTouchY)
        if (isHorizontalSwipe) {
            return
        }

        let newPosition = currentPosition;
        
        if (isQuickSwipe) {
            if (drawerSwipeDirection === 'up') {
                newPosition = 60
            }
            else if (drawerSwipeDirection === 'down') {
                if (currentPosition > 30) {
                    newPosition = 30
                }
                else {
                    setDrawerContent(null)
                    newPosition = snappedPosition
                }
            }
        }
        else {
            // Custom snapping logic for positions 25, 40, 80
            const snapPositions = [30, 60];
            let closestPosition = snapPositions[0];
            let minDistance = Math.abs(currentPosition - closestPosition);
            
            for (const pos of snapPositions) {
                const distance = Math.abs(currentPosition - pos);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPosition = pos;
                }
            }
            
            // Determine direction-based snapping
            if (drawerSwipeDirection === 'up') {
                // Find the next higher position
                newPosition = snapPositions.find(pos => pos > currentPosition) || snapPositions[snapPositions.length - 1];
            } else if (drawerSwipeDirection === 'down') {
                // Find the next lower position
                const lowerPositions = snapPositions.filter(pos => pos < currentPosition);
                if (lowerPositions.length > 0) {
                    newPosition = lowerPositions[lowerPositions.length - 1];
                } else {
                    setDrawerContent(null)
                    newPosition = snappedPosition
                }
            } else {
                // Use closest position
                newPosition = closestPosition;
            }
            
            if (newPosition < 30) {
                setDrawerContent(null)
                newPosition = snappedPosition  // Keep original logic - don't change this!
            }
            else if (newPosition > 60) {
                newPosition = 60
            }
        }

        setCurrentPosition(newPosition);
        setSnappedPosition(newPosition);
        setDrawerSwipeDirection(null);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.target && isScrolling(e.target)) {
            return
        }

        const isHorizontalSwipe = Math.abs(startTouchX - e.touches[0].clientX) > Math.abs(startTouchY - e.touches[0].clientY)
        if (isHorizontalSwipe) {
            return
        }

        const newHeight = snappedPosition - pos2svh(startTouchY) + pos2svh(e.touches[0].clientY)
        setDrawerSwipeDirection(newHeight > currentPosition ? 'up' : 'down');
        setCurrentPosition(newHeight < 60 ? newHeight : 60);
    }

    useEffect(() => {
       
        if (details) {
            setDrawerContent('details')
        }
        else if (nav) {
            setDrawerContent(nav)
        }
        else if (!searchFilterParamsString) {
            setDrawerContent(null)
        }
    }
        , [searchFilterParamsString, nav, doc, group, details])

    const toggleDrawer = (tab: string) => {
        setDrawerContent(prev => prev == tab ? null : tab)
    }


    useEffect(() => {
        const handleScroll = () => {
            if (!scrollableContent.current) return;

            if (scrollableContent.current.scrollTop > 300) {
                setShowScrollToTop(true);
            } else {
                setShowScrollToTop(false);
            }
        };

        const currentRef = scrollableContent.current;
        if (currentRef && currentPosition === 60) {
            currentRef.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [currentPosition]);

    useEffect(() => {
        setShowScrollToTop(false);
    }, [drawerContent]);

    useEffect(() => {
        if (!drawerContent) return;

        function handleClickOutside(event: MouseEvent) {
            if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                if (!group && !doc) {
                    setDrawerContent(null)
                }
                else {
                    setCurrentPosition(30)
                    setSnappedPosition(30)
                    setSnapped(true)
                }


            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [drawerContent, doc, group]);


    return <>
    {snappedPosition < 60 &&  <>
    	<div
	className={`absolute flex gap-2 left-3 z-[4000]`}
	style={{ bottom: drawerContent ? `calc(${currentPosition}svh - 1.75rem)` : '2rem' }}
>
{drawerContent != 'filters' && <ClickableIcon
	onClick={() => toggleDrawer('filters')}
	label="Filtre"
	className={`rounded-full bg-white text-neutral-800 shadow-lg p-3 ${snapped ? 'transition-[bottom] duration-300 ease-in-out' : ''}`}
>
	<PiFunnel className="text-2xl" aria-hidden="true" />
	</ClickableIcon>}

    {!drawerContent && <ClickableIcon
	onClick={() => toggleDrawer('details')}
	label="Oppslag"
	className={`rounded-full bg-white text-neutral-800 shadow-lg p-3 ${snapped ? 'transition-[bottom] duration-300 ease-in-out' : ''}`}
>
	<PiBookOpen className="text-2xl" aria-hidden="true" />
	</ClickableIcon>}
	
	</div>
   <div className="absolute flex gap-2 right-3 z-[4000]"
    style={{ bottom: drawerContent ? `calc(${currentPosition}svh - 1.75rem)` : '2rem' }}
    >
        <ClickableIcon
        label="Min posisjon"
        onClick={() => {}}
        className="rounded-full bg-white text-neutral-800 shadow-lg p-3"
        >
        <PiGpsFix className="text-2xl" aria-hidden="true" />
        </ClickableIcon>
    </div>
    <div className="absolute flex gap-2 top-[4.5rem] right-3 z-[4000]">
        <ClickableIcon
        label="Min posisjon"
        onClick={() => {}}
        className="rounded-full bg-white text-neutral-800 shadow-lg p-3"
        >
        <PiStackPlus className="text-2xl" aria-hidden="true" />
        </ClickableIcon>
    </div></>}
    
    <div className="scroll-container">
        
        <div
            ref={drawerRef}
            className={`mobile-interface fixed -bottom-10 w-full h-full  rounded-t-full drawer bg-white ${snapped ? 'transition-[height] duration-300 ease-in-out ' : ''}`}
            style={{ height: `${drawerContent ? currentPosition : 0}svh` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}>
            {drawerContent && <>
                <div className={`w-full flex  items-center h-4 pt-2 rounded-t-full bg-white relative px-2`} style={{ touchAction: 'none' }}>
                    <div className="absolute -translate-x-1/2 -translate-y-1 left-1/2 w-16 h-1.5 bg-neutral-200 rounded-full"></div></div>
                <div className={`h-full bg-white flex flex-col pb-20 max-h-[calc(100svh-10rem)] ${snappedPosition == 60 ? 'border-t border-neutral-200' : ''} overscroll-contain`} ref={scrollableContent} style={{ overflowY: snappedPosition == 60 && currentPosition == 60 ? 'auto' : 'hidden', touchAction: ( snappedPosition == 60 && currentPosition == 60 && isScrollable()) ? 'pan-y' : 'none' }}>
                    {drawerContent == 'details' && <>
                        {group && !doc && <div className="pb-24">
                            <ListExplorer />
                            {groupDoc?._source?.location && <Clickable className="px-3 bg-neutral-50 text-xl border-y border-neutral-200 w-full mt-4 aria-[current=true]:btn-accent flex items-center gap-2 flex-shrink-0 whitespace-nowrap h-12" add={{details: 'overview', namesScope: 'extended'}}>
                               
                                Finn liknande namn<PiCaretRightBold className="text-primary-600" aria-hidden="true"/>
                            </Clickable>}
                            </div>}
                        { doc && <div className="pb-24 p-2"><DocInfo /></div>}
                        {false && details && details != 'group' && !doc &&
                            <div className="pb-12 pt-2 px-2">
                                <span className="flex items-center pb-2 text-xl"><h2 className="text-neutral-800 text-2xl tracking-wide flex items-center gap-1 ">{groupLabel}</h2>
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
                            <div className="flex flex-wrap items-center gap-2 p-2"><CadastreBreadcrumb/></div>
                            <TreeList/>
                        </section>
                    }
                    {false && drawerContent == 'results' && datasetTag != 'tree' &&
                        <section className="flex flex-col gap-2 p-2">
                            <h2 className="text-xl text-neutral-800 font-bold uppercase tracking-wide border-b border-neutral-200 pb-2 flex items-center gap-1">
                                Treff <span className={`results-badge bg-primary-500 left-8 rounded-full text-white text-xs whitespace-nowrap ${totalHits && totalHits.value < 10 ? 'px-1.5' : 'px-1'}`}>
                                    {totalHits && formatNumber(totalHits.value)}
                                </span>
                            </h2>
                            {(searchParams.get('q') || searchParams.get('fulltext') == 'on') && <div className="flex flex-wrap gap-2 pb-2 border-b border-neutral-200">
                                <ActiveFilters />
                            </div>}

                            <SearchResults />
                        </section>

                    }
                    {(drawerContent == 'datasets') &&
                        <div className="p-2">
                            <h2 className="text-xl text-neutral-800 font-bold uppercase tracking-wide pb-2 flex items-center gap-1 px-1">
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
                            <h2 className="text-xl text-neutral-800 font-bold uppercase tracking-wide border-b border-neutral-200 pb-2 flex items-center gap-1">Filter {facetFilters.length > 0 && <span className="results-badge bg-primary-500 left-8 rounded-full px-1 text-white text-xs whitespace-nowrap">{facetFilters.length}</span>}</h2>
                            <FacetSection />
                        </div>

                    }
                </div>
            </>
            }
            <div ref={mobileNav} className="fixed bottom-0 left-0 w-full">
                <MobileSearchNav showScrollToTop={showScrollToTop} currentPosition={currentPosition} drawerContent={drawerContent || ''} scrollableContent={scrollableContent} />

            <div className="hidden bg-neutral-100 text-white w-full h-14 p-1 flex items-center justify-between nav-toolbar">
                {<Clickable onClick={() => toggleDrawer('datasets')} label="Datasett" aria-current={(drawerContent && ["datasets"].includes(drawerContent)) ? 'page' : 'false'}>
                    <div className="relative">
                        <PiDatabase className="text-3xl" />
                        {datasetCount > 0 && <span className={`results-badge bg-primary-500 absolute -top-1 left-full -ml-2 rounded-full text-white text-xs ${datasetCount < 10 ? 'px-1.5' : 'px-1'}`}>
                            {formatNumber(datasetCount)}
                        </span>}
                        {!datasetCount && <span className="results-badge bg-primary-500 absolute -top-1 left-full -ml-2 rounded-full h-2 w-2">    </span>}
                    </div>
                </Clickable>}



                

                { datasetTag != 'tree' && <Clickable aria-label="Filtre" onClick={() => toggleDrawer('filters')} add={nav == 'filters' ? { nav: null } : { nav: 'filters' }} remove={['details']} aria-current={drawerContent == 'filters' || drawerContent == 'adm' ? 'page' : 'false'}>
                    <div className="relative">
                        <PiFunnel className="text-3xl" />
                        {facetFilters.length > 0 && <span className={`results-badge bg-primary-500 absolute -top-1 left-full -ml-2 rounded-full text-white text-xs ${facetFilters.length < 10 ? 'px-1.5' : 'px-1'}`}>
                            {facetFilters.length}
                        </span>}
                    </div>
                </Clickable>}

                {mode != 'table' && datasetTag != 'tree' &&
                    <Clickable aria-label='Søkeresultater' onClick={() => toggleDrawer('results')} remove={['details']}
                        aria-current={drawerContent == 'results' ? 'page' : 'false'}>
                        <div className="relative">
                            <PiListBullets className="text-3xl" />
                            <span className={`results-badge bg-primary-500 absolute -top-1 left-full -ml-2 rounded-full text-white text-xs ${totalHits && totalHits.value < 10 ? 'px-1.5' : 'px-1'}`}>
                                {totalHits && formatNumber(totalHits.value)}
                            </span>
                        </div>
                    </Clickable>}

                {mode != 'table' && datasetTag == 'tree' &&
                    <Clickable aria-label='Register' onClick={() => toggleDrawer('tree')} remove={['details']}
                        aria-current={drawerContent == 'tree' ? 'page' : 'false'}>
                        <div className="relative">
                            <PiTreeViewFill className="text-3xl" />
                            <span className={`results-badge bg-primary-500 absolute -top-1 left-full -ml-2 rounded-full text-white text-xs ${totalHits && totalHits.value < 10 ? 'px-1.5' : 'px-1'}`}>
                                {totalHits && formatNumber(totalHits.value)}
                            </span>
                        </div>
                    </Clickable>}

                {(doc || (group && groupTotal?.value > 0)) &&  <Clickable aria-label="Oppslag" onClick={() => toggleDrawer('details')} add={{details: 'group'}} aria-current={drawerContent == 'details' ? 'page' : 'false'}>
                     <div className="relative">
                        <PiBookOpen className="text-3xl" />
                            <span className={`results-badge bg-primary-500 absolute -top-1 left-full -ml-2 rounded-full text-white text-xs ${groupTotal && groupTotal.value < 10 ? 'px-1.5' : 'px-1'}`}>
                                { groupTotal && formatNumber(groupTotal.value)}
                            </span>
                        </div>
                </Clickable>}

                
            </div>
            
        </div>
        </div>

        <div className={`absolute top-12 right-0 w-full rounded-md z-[1000] ${mode == 'map' ? '' : 'max-h-[calc(100svh-6rem)] h-full overflow-y-auto stable-scrollbar'}`}>
            <StatusSection />
            {mode == 'table' && <TableExplorer />}
            {mode == 'list' && <ListExplorer />}
            {doc && mode == 'doc' && <DocInfo />}
        </div>

        {mode == 'map' && <div ref={mapContainerRef} className="absolute top-0 right-0 bottom-0 top-[3.5rem] max-h-[calc(100svh-3.5rem)] w-full bg-white rounded-md">
            <MapWrapper />

        </div>}

        


    </div>
    </>
}