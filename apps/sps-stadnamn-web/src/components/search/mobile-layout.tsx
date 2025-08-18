'use client'
import { useContext, useEffect, useRef, useState } from "react"
import { PiBinoculars, PiBookOpen, PiDatabase, PiDatabaseFill, PiDatabaseLight, PiFunnel, PiListBullets, PiTreeViewFill, PiWallFill, PiWallLight } from "react-icons/pi";
import Results from "./nav/results/search-results";
import MapExplorer from "./map-explorer";
import { usePerspective, useSearchQuery, useMode } from "@/lib/search-params";
import StatusSection from "./status-section";
import { SearchContext } from "@/app/search-provider";
import TreeResults from "./nav/results/tree-results";
import TableExplorer from "./table/table-explorer";
import { treeSettings } from "@/config/server-config";
import { useSearchParams } from "next/navigation";
import ListExplorer from "./list/list-explorer";
import { DocContext } from "@/app/doc-provider";
import DocInfo from "./details/doc/doc-info";
import DocSkeleton from "../doc/doc-skeleton";
import FacetSection from "./nav/facets/facet-section";
import ActiveFilters from "./form/active-filters";
import { base64UrlToString, formatNumber, stringToBase64Url } from "@/lib/utils";
import DatasetFacet from "./nav/facets/dataset-facet";
import Clickable from "../ui/clickable/clickable";
import { GroupContext } from "@/app/group-provider";
import GroupDetails from "./details/group/group-details";
import FuzzyExplorer from "./fuzzy/fuzzy-explorer";
import ClickableIcon from "../ui/clickable/clickable-icon";
import HorizontalSwipe from "./details/doc/horizontal-swipe";
import { PiStackFill, PiStackLight, PiMicroscopeFill, PiMicroscopeLight, PiTreeViewLight } from 'react-icons/pi';
import HitNavigation from "./details/hit-navigation";
import { useRouter } from "next/navigation";
import InfoPopover from "../ui/info-popover";

export default function MobileLayout() {
    const [currentPosition, setCurrentPosition] = useState(25);
    const [snappedPosition, setSnappedPosition] = useState(25);
    const [snapped, setSnapped] = useState(false);
    const [startTouchY, setStartTouchY] = useState(0);
    const [startTouchX, setStartTouchX] = useState(0);
    const [drawerSwipeDirection, setDrawerSwipeDirection] = useState<null | 'up' | 'down'>(null);
    const scrollableContent = useRef<HTMLDivElement>(null);
    const [startTouchTime, setStartTouchTime] = useState<number>(0);
    const searchParams = useSearchParams()

    const [drawerContent, setDrawerContent] = useState<string | null>(null)
    const nav = searchParams.get('nav')
    
    const doc = searchParams.get('doc')
    const { searchFilterParamsString, facetFilters, datasetFilters } = useSearchQuery()
    const { totalHits, isLoading } = useContext(SearchContext)
    const [facetIsLoading, setFacetIsLoading] = useState(false)
    const [ showLoading, setShowLoading ] = useState<boolean>(false)
    const mode = useMode()
    const { docLoading, docData } = useContext(DocContext)
    const datasetCount = searchParams.getAll('indexDataset')?.length || 0
    const fulltext = searchParams.get('fulltext')
    const details = searchParams.get('details')
    const { groupTotal } = useContext(GroupContext)
    const fuzzyNav = searchParams.get('fuzzyNav')
    const group = searchParams.get('group')
    const { setInitialUrl } = useContext(GroupContext)

    const boost_gt = searchParams.get('boost_gt')
    const cadastralIndex = searchParams.get('cadastralIndex')
    const datasetTag = searchParams.get('datasetTag')


    useEffect(() => {
        if (!isLoading && !facetIsLoading) {
          setTimeout(() => {
            setShowLoading(false)
          }, 100);
        }
        else {
          setShowLoading(true)
        }
      }
      , [isLoading, facetIsLoading])

    const isScrolling = (target: EventTarget) => {
        if (snappedPosition == 75 && target instanceof Node && scrollableContent.current?.contains(target)) {
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
        return (windowHeight - yPos) / windowHeight * 75
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

        // Detect quick swipe up or down, resulting in 25% or 100% height
        const endTouchY = e.changedTouches[0].clientY;
        const endTouchX = e.changedTouches[0].clientX;
        const endTouchTime = Date.now();
        const touchDuration = endTouchTime - startTouchTime;
        const swipeDistance = startTouchY - endTouchY;
        const isQuickSwipe = touchDuration < 400 //&& Math.abs(swipeDistance) > 100;

        const isHorizontalSwipe = Math.abs(startTouchX - endTouchX) > Math.abs(startTouchY - endTouchY)
        if (isHorizontalSwipe) {
            return
        }


        let newPosition = drawerSwipeDirection === 'up' ? Math.ceil(currentPosition / 25) * 25 : Math.floor(currentPosition / 25) * 25
        if (isQuickSwipe) {
            if (drawerSwipeDirection === 'up') {
                newPosition = 75
            }
            if (drawerSwipeDirection === 'down') {
                if (currentPosition > 25) {
                    newPosition = 25
                }
                else {
                    setDrawerContent(null)
                    newPosition = snappedPosition
                }
            }

        }
        else {
            if (newPosition < 25) {
                setDrawerContent(null)
                newPosition = snappedPosition
            }
            
            else if (newPosition > 75) {
                newPosition = 75
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
        setCurrentPosition(newHeight < 75 ? newHeight : 75);

    }


    useEffect(() => {
        if (nav) {
            setDrawerContent(nav)
        }
        else if (details) {
            setDrawerContent('details')
        }
        else if (!searchFilterParamsString) {
            setDrawerContent(null)
        }
    }
    , [searchFilterParamsString, nav, details, doc])



    const toggleDrawer = (tab: string) => {
        setDrawerContent(prev => prev == tab ? null : tab)
    }

    useEffect(() => {
  
            setCurrentPosition(25)
            setSnappedPosition(25)
            setDrawerSwipeDirection(null);
            setSnapped(true);
            scrollableContent.current?.scrollTo(0, 0)

    }, [drawerContent])

    



    return <div className="scroll-container">
       

        
        

        <div className={`mobile-interface fixed bottom-12 w-full rounded-t-xl bg-neutral-800  ${snapped ? 'transition-all duration-300 ease-in-out ' : ''}`}
             style={{height: `${drawerContent ? currentPosition : 0}svh`}}
             onTouchStart={handleTouchStart} 
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}>
        { drawerContent && <>
            <div className="w-full flex  items-center h-4 pt-2 rounded-t-md bg-neutral-800 relative px-2" style={{touchAction: 'none'}}>
                <div className="absolute -translate-x-1/2 left-1/2 h-1.5 top-1.5 w-16 bg-neutral-300 rounded-full"></div></div>

            <div className={`h-full bg-white flex flex-col rounded-lg shadow-inner border-4 border-neutral-800 shadow-inner max-h-[calc(100svh-12rem)] overscroll-contain`} ref={scrollableContent} style={{overflowY: currentPosition == 75 ? 'auto' : 'hidden', touchAction: (currentPosition == 75 && isScrollable()) ? 'pan-y' : 'none'}}>

            {drawerContent == 'details' && <>
            {doc && details == 'doc' && !fuzzyNav && <div className="pb-24"><HorizontalSwipe><ListExplorer/> </HorizontalSwipe></div>}
            {details == 'group' && <div className="pb-12 pt-2 px-2">
                <h2 className="text-xl text-neutral-800 font-bold uppercase tracking-wide flex items-center gap-1 pb-2">Oversikt</h2>
                
                <GroupDetails/>
            </div>}
            {fuzzyNav &&
            <div className="pb-12 pt-2 px-2">
            <span className="flex items-center pb-2 text-xl"><h2 className="text-neutral-800 font-bold uppercase tracking-wide flex items-center gap-1 ">{fuzzyNav == 'list' ? <>Namneformer</> : 'Tidslinje'}</h2>
            <InfoPopover>
        Få oversikt over liknande oppslag i nærområdet. Treffa er ikkje nødvendigvis former av namnet du har valt, og det kan vere namnformer som ikkje kjem med.
        </InfoPopover></span>
            <FuzzyExplorer/>
            </div>
            }

            
            </>}
            { drawerContent == 'results' && 
                <section className="flex flex-col gap-2 p-2">
                    <h2 className="text-xl text-neutral-800 font-bold uppercase tracking-wide border-b border-neutral-200 pb-2 flex items-center gap-1">
                        Treff <span className={`results-badge bg-primary-500 left-8 rounded-full text-white text-xs whitespace-nowrap ${totalHits && totalHits.value < 10 ? 'px-1.5' : 'px-1'}`}>
                            {totalHits && formatNumber(totalHits.value)}
                        </span>
                    </h2>
                    {(searchParams.get('q') || searchParams.get('fulltext') == 'on') && <div className="flex flex-wrap gap-2 pb-2 border-b border-neutral-200">
                <ActiveFilters showQuery={true}/>
                </div>}
                    
                <Results/>
                </section>
            
             }
            { (drawerContent == 'datasets' || drawerContent == 'datasetInfo') &&
            <div className="p-2">
            <h2 className="text-xl text-neutral-800 font-bold uppercase tracking-wide pb-2 flex items-center gap-1 px-1">
                {datasetTag == 'tree' && 'Hierarki'}
                {datasetTag == 'base' && 'Grunnord'}
                {datasetTag == 'deep' && 'Djupinnsamlingar'}
                {!datasetTag && 'Datasett'}
            </h2>
            { (datasetFilters.length > 0 && !cadastralIndex)  && <div className="flex flex-wrap gap-2 py-2 mb-2 border-y border-neutral-200">
                <ActiveFilters showDatasets={true}/>
                </div>}
            <DatasetFacet/> 

            <div 
                className={`absolute bottom-0 left-1 right-1 bg-neutral-200 border-t border-neutral-300 text-neutral-900 h-12 p-1 flex items-center gap-2 details-toolbar justify-between transition-all duration-300 ease-in-out`}
                style={{
                    transform: currentPosition > 25 ? 'translateY(0)' : 'translateY(100%)',
                    opacity: currentPosition > 25 ? 1 : 0,
                    pointerEvents: currentPosition > 25 ? 'auto' : 'none'
                }}>
                <ClickableIcon 
                    label="Alle" 
                    remove={["datasetTag"]} 
                    aria-current={!datasetTag ? 'page' : 'false'}>
                    {!datasetTag ? 
                        <PiDatabaseFill className="text-3xl text-white" /> : 
                        <PiDatabaseLight className="text-3xl" />}
                </ClickableIcon>

                <ClickableIcon 
                    label="Djupinnsamlingar" 
                    add={{ datasetTag: 'deep'}}
                    aria-current={datasetTag == 'deep' ? 'page' : 'false'}>
                    {datasetTag == 'deep' ? 
                        <PiMicroscopeFill className="text-3xl text-white" /> : 
                        <PiMicroscopeLight className="text-3xl" />}
                </ClickableIcon>

                <ClickableIcon 
                    label="Hierarki" 
                    remove={["boost_gt"]}
                    add={{ datasetTag: 'tree'}}
                    aria-current={datasetTag == 'tree' ? 'page' : 'false'}>
                    {datasetTag == 'tree' ? 
                        <PiTreeViewFill className="text-3xl text-white" /> : 
                        <PiTreeViewLight className="text-3xl" />}
                </ClickableIcon>
                <ClickableIcon 
                    label="Grunnord" 
                    add={{ datasetTag: 'base'}}
                    aria-current={datasetTag == 'base' ? 'page' : 'false'}>
                    {datasetTag == 'base' ? 
                        <PiWallFill className="text-3xl text-white" /> : 
                        <PiWallLight className="text-3xl" />}
                </ClickableIcon>
            </div>
</div>
            
            
            }
            { (drawerContent == 'filters' || drawerContent == 'adm') && 
                <div className="p-2">
                <h2 className="text-xl text-neutral-800 font-bold uppercase tracking-wide border-b border-neutral-200 pb-2 flex items-center gap-1">Filter {facetFilters.length > 0 && <span className="results-badge bg-primary-500 left-8 rounded-full px-1 text-white text-xs whitespace-nowrap">{facetFilters.length}</span>}</h2>
                {facetFilters.length > 0 && <div className="flex flex-col">
                
                <div className="flex flex-wrap gap-2 py-2 border-b border-neutral-200">
                <ActiveFilters showFacets={true}/>
                </div>
                </div>}
                <FacetSection/> 
                </div>
                
            }
            { /* drawerContent == 'cadastre' && 
                <CadastralSubdivisions dataset={dataset} doc={doc} childrenData={childrenData} landingPage={false}/>
             */}
            { drawerContent == 'tree' &&
                <TreeResults/>
            }
            {drawerContent == 'details' &&  <div 
    className={`absolute bottom-0 left-1 right-1 bg-neutral-200 border-t border-neutral-300 text-neutral-900 h-12 p-1 flex items-center gap-2 details-toolbar justify-between transition-all duration-300 ease-in-out`}
    style={{
        transform: currentPosition > 25 ? 'translateY(0)' : 'translateY(100%)',
        opacity: currentPosition > 25 ? 1 : 0,
        pointerEvents: currentPosition > 25 ? 'auto' : 'none'
    }}>
                <ClickableIcon label="Oppslag" remove={['details', 'fuzzyNav']} add={{details: 'doc'}} aria-current={!fuzzyNav && details == 'doc' ? 'page' : 'false'} className="group">
                    <div className="relative">
                    <PiBookOpen className="text-3xl" />
                    {groupTotal?.value && Number(groupTotal.value) > 1 && <span className={`results-badge bg-primary-500 absolute group-aria-[current=page]:!bg-white group-aria-[current=page]:!text-accent-700 -top-1 left-full -ml-2 rounded-full text-white text-xs ${Number(groupTotal.value) < 10 ? 'px-1.5' : 'px-1'}`}>
                            {formatNumber(groupTotal?.value)}
                        </span>}
                    </div>
                </ClickableIcon>
                {!group || !base64UrlToString(group).startsWith('grunnord') && <>
                <ClickableIcon
                    label="Finn namneformer"
                    aria-current={fuzzyNav == 'list' ? 'page' : 'false'}
                    remove={['details']} 
                    onClick={() => setInitialUrl(`?${searchParams.toString()}`)}
                    add={{group: stringToBase64Url(docData?._source.group.id), fuzzyNav: 'list'}}>
                    <PiBinoculars className="text-3xl" aria-hidden="true"/>
                </ClickableIcon>
                </>}
    
                
 
            </div>}


           
            


            </div>
            
            </>
            }

<div className="absolute left-1 z-[2000] right-0 flex flex-col gap-2">
</div>
            
            <div className="fixed bottom-0 left-0 bg-neutral-800 text-white w-full h-12 p-1 flex items-center justify-between nav-toolbar">
                {!datasetTag && <Clickable onClick={() => toggleDrawer('datasets')} label="Datasett" add={nav == 'datasets' ? {nav: null} : {nav: 'datasets'}} aria-current={(drawerContent && ["datasetInfo", "datasets"].includes(drawerContent)) ? 'page' : 'false'}>
                    <div className="relative">
                        <PiDatabase className="text-3xl" />
                        {datasetCount > 0 && <span className={`results-badge bg-primary-500 absolute -top-1 left-full -ml-2 rounded-full text-white text-xs ${datasetCount < 10 ? 'px-1.5' : 'px-1'}`}>
                            {formatNumber(datasetCount)}
                        </span>}
                    </div>
                </Clickable>}
                {boost_gt == '3' && <Clickable onClick={() => toggleDrawer('datasets')} label="Djupinnsamlingar" add={nav == 'datasets' ? {nav: null} : {nav: 'datasets'}} aria-current={(drawerContent && ["datasetInfo", "datasets"].includes(drawerContent)) ? 'page' : 'false'}>
                    <div className="relative">
                        <PiMicroscopeFill className="text-3xl" />
                        {datasetCount > 0 && <span className={`results-badge bg-primary-500 absolute -top-1 left-full -ml-2 rounded-full text-white text-xs ${datasetCount < 10 ? 'px-1.5' : 'px-1'}`}>
                            {formatNumber(datasetCount)}
                        </span>}
                    </div>
                </Clickable>}
                {cadastralIndex && <Clickable onClick={() => toggleDrawer('datasets')} label="Hierarki" add={nav == 'datasets' ? {nav: null} : {nav: 'datasets'}} aria-current={(drawerContent && ["datasetInfo", "datasets"].includes(drawerContent)) ? 'page' : 'false'}>
                    <PiTreeViewFill className="text-3xl" />
                </Clickable>}

                {datasetTag == 'base' && <Clickable onClick={() => toggleDrawer('datasets')} label="Grunnord" add={nav == 'datasets' ? {nav: null} : {nav: 'datasets'}} aria-current={(drawerContent && ["datasetInfo", "datasets"].includes(drawerContent)) ? 'page' : 'false'}>
                    <PiWallFill className="text-3xl" />
                </Clickable>}
                

                {datasetTag == 'tree' && <Clickable aria-label='Register' onClick={() => toggleDrawer('tree')} add={nav == 'tree' ? {nav: null} : {nav: 'tree'}} aria-current={drawerContent == 'tree' ? 'page' : 'false'}>
                    <PiTreeViewFill className="text-3xl" />
                </Clickable>}

                {<Clickable aria-label="Filtre" onClick={() => toggleDrawer('filters')} add={nav == 'filters' ? {nav: null} : {nav: 'filters'}} aria-current={drawerContent == 'filters' || drawerContent == 'adm' ? 'page' : 'false'}>
                    <div className="relative">
                        <PiFunnel className="text-3xl" />
                        {facetFilters.length > 0 && <span className={`results-badge bg-primary-500 absolute -top-1 left-full -ml-2 rounded-full text-white text-xs ${facetFilters.length < 10 ? 'px-1.5' : 'px-1'}`}>
                            {facetFilters.length}
                        </span>}
                    </div>
                </Clickable>}

                {mode != 'table' &&
                    <Clickable aria-label='Søkeresultater' onClick={() => toggleDrawer('results')} add={nav == 'results' ? {nav: null} : {nav: 'results'}}
                        aria-current={drawerContent == 'results' ? 'page' : 'false'}>
                        <div className="relative">
                            <PiListBullets className="text-3xl" />
                            <span className={`results-badge bg-primary-500 absolute -top-1 left-full -ml-2 rounded-full text-white text-xs ${totalHits && totalHits.value < 10 ? 'px-1.5' : 'px-1'}`}>
                                {totalHits && formatNumber(totalHits.value)}
                            </span>
                        </div>
                    </Clickable>}

                {doc && <Clickable aria-label="Oppslag" onClick={() => toggleDrawer('details')} add={{details: details || 'doc', nav: null}} aria-current={drawerContent == 'details' ? 'page' : 'false'}>
                    <PiBookOpen className="text-3xl" />
                </Clickable>}


            </div>
            
        </div>

        <div className={`absolute top-12 right-0 w-full bg-transparent rounded-md z-[1000] ${mode == 'map' ? '' : 'max-h-[calc(100svh-6rem)] h-full overflow-y-auto stable-scrollbar'}`}>
        <StatusSection/>
        { mode == 'table' && <TableExplorer/>}
        { mode == 'list'  && <ListExplorer/>}
        {doc && mode == 'doc' && (docLoading ? <DocSkeleton/> : <DocInfo/>)}
        </div>

        <div className="absolute top-12 right-0 bottom-0 max-h-[calc(100svh-6rem)] w-full bg-white rounded-md">
        { mode == 'map' && <MapExplorer/>}
        
        </div>


    </div>
}