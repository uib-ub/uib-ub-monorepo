'use client'
import { useContext, useEffect, useRef, useState } from "react"
import { PiBookOpen, PiDatabase, PiFunnel, PiListBullets, PiTreeViewFill } from "react-icons/pi";
import Results from "./nav/results/search-results";
import MapExplorer from "./map-explorer";
import { useQueryState } from "nuqs";
import { usePerspective, useSearchQuery, useMode } from "@/lib/search-params";
import StatusSection from "./status-section";
import { SearchContext } from "@/app/search-provider";
import TreeResults from "./nav/results/tree-results";
import DatasetDrawer from "./datasets/dataset-drawer";
import TableExplorer from "./table/table-explorer";
import { treeSettings } from "@/config/server-config";
import { useSearchParams } from "next/navigation";
import ListExplorer from "./list/list-explorer";
import { DocContext } from "@/app/doc-provider";
import DocInfo from "./details/doc/doc-info";
import DocSkeleton from "../doc/doc-skeleton";
import FacetSection from "./nav/facets/facet-section";
import ActiveFilters from "./form/active-filters";
import { formatNumber } from "@/lib/utils";
import DatasetFacet from "./nav/facets/dataset-facet";

export default function MobileLayout() {
    const [currentPosition, setCurrentPosition] = useState(25);
    const [snappedPosition, setSnappedPosition] = useState(25);
    const [snapped, setSnapped] = useState(false);
    const [startTouchY, setStartTouchY] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<null | 'up' | 'down'>(null);
    const scrollableContent = useRef<HTMLDivElement>(null);
    const [startTouchTime, setStartTouchTime] = useState<number>(0);

    const [drawerContent, setDrawerContent] = useState<string | null>(null)
    const [nav, setNav] = useQueryState('nav')
    
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const { searchFilterParamsString, facetFilters, datasetFilters } = useSearchQuery()
    const { totalHits, isLoading } = useContext(SearchContext)
    const [facetIsLoading, setFacetIsLoading] = useState(false)
    const [ showLoading, setShowLoading ] = useState<boolean>(false)
    const perspective = usePerspective()
    const mode = useMode()
    const { docLoading } = useContext(DocContext)
    const datasetCount = searchParams.getAll('indexDataset')?.length || 0
    const deepCollections = searchParams.get('boost_gt') == '3'
    const fulltext = searchParams.get('fulltext')



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
        setStartTouchTime(Date.now());
        setSnapped(false);
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        setSnapped(true);

        // Detect quick swipe up or down, resulting in 25% or 100% height
        const endTouchY = e.changedTouches[0].clientY;
        const endTouchTime = Date.now();
        const touchDuration = endTouchTime - startTouchTime;
        const swipeDistance = startTouchY - endTouchY;
        const isQuickSwipe = touchDuration < 100 && Math.abs(swipeDistance) > 50;
        let newPosition = swipeDirection === 'up' ? Math.ceil(currentPosition / 25) * 25 : Math.floor(currentPosition / 25) * 25
        if (isQuickSwipe) {
            if (swipeDirection === 'up') {
                newPosition = 75
            }
            if (swipeDirection === 'down') {
                newPosition = 25
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
        setSwipeDirection(null);


    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.target && isScrolling(e.target)) {
            return
        }
        const newHeight = snappedPosition - pos2svh(startTouchY) + pos2svh(e.touches[0].clientY)
        setSwipeDirection(newHeight > currentPosition ? 'up' : 'down');
        setCurrentPosition(newHeight < 75 ? newHeight : 75);

    }

    useEffect(() => {
        if (doc) {
            setDrawerContent('info')
        }
        else {
            setDrawerContent(null)
        }
    }
    , [doc])

    useEffect(() => {
        if (nav && searchFilterParamsString) {
            setDrawerContent(nav)
        }
    }
    , [searchFilterParamsString, nav])



    const switchTab = (tab: string) => {

        if (drawerContent == tab) {
            setDrawerContent(null)
        }
        else {
            if (tab == 'tree') {
                setNav('tree')
            }
            if (tab == 'datasets') {
                setNav('datasets')
            }
            if (tab == 'filters') {
                setNav('filters')
            }
            if (tab == 'results') {
                setNav('results')
            }
            setDrawerContent(tab)

        }

    }

    useEffect(() => {
  
            setCurrentPosition(25)
            setSnappedPosition(25)
            setSwipeDirection(null);
            setSnapped(true);
            scrollableContent.current?.scrollTo(0, 0)

    }, [drawerContent])

    useEffect(() => {
        if (doc) {
            setDrawerContent('info')
        }
    }, [doc, setDrawerContent])



    return <div className="scroll-container">

        
        

        <div className={`mobile-interface fixed bottom-12 w-full rounded-t-xl bg-neutral-800  ${snapped ? 'transition-all duration-300 ease-in-out ' : ''}`}
             style={{height: `${drawerContent ? currentPosition : 0}svh`}}
             onTouchStart={handleTouchStart} 
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}>
        { drawerContent && <>
            <div className="w-full flex  items-center h-4 pt-2 rounded-t-md bg-neutral-800 relative px-2" style={{touchAction: 'none'}}>
                <div className="absolute -translate-x-1/2 left-1/2 h-1.5 top-1.5 w-16 bg-neutral-300 rounded-full"></div></div>

            <div className={`h-full bg-white flex flex-col mobile-padding rounded-lg shadow-inner border-4 border-neutral-800 shadow-inner max-h-[calc(100svh-12rem)] overscroll-contain pt-2`} ref={scrollableContent} style={{overflowY: currentPosition == 75 ? 'auto' : 'hidden', touchAction: (currentPosition == 75 && isScrollable()) ? 'pan-y' : 'none'}}>

            {drawerContent == 'info' && <>
            {doc && mode != 'doc' && (docLoading ? <DocSkeleton/> : <DocInfo/>)}
            </>}
            { drawerContent == 'results' && 
                <section className="flex flex-col gap-2">
                    <h2 className="text-xl text-neutral-800 font-bold uppercase tracking-wide border-b border-neutral-200 pb-2 flex items-center gap-1">
                        Treff <span className={`results-badge bg-primary-500 left-8 rounded-full text-white text-xs whitespace-nowrap ${totalHits && totalHits.value < 10 ? 'px-1.5' : 'px-1'}`}>
                            {totalHits && formatNumber(totalHits.value)}
                        </span>
                    </h2>
                <Results/>
                </section>
            
             }
            { (drawerContent == 'datasets' || drawerContent == 'datasetInfo') &&
            <>
            <h2 className="text-xl text-neutral-800 font-bold uppercase tracking-wide pb-2 flex items-center gap-1">Datasett</h2>
            { (datasetFilters.length > 0 || deepCollections)  && <div className="flex flex-wrap gap-2 py-2 mb-2 border-y border-neutral-200">
                <ActiveFilters showFacets={false}/>
                </div>}
            <DatasetFacet/> 

            </>
            
            
            }
            { (drawerContent == 'filters' || drawerContent == 'adm') && 
                <>
                <h2 className="text-xl text-neutral-800 font-bold uppercase tracking-wide border-b border-neutral-200 pb-2 flex items-center gap-1">Filter {facetFilters.length > 0 && <span className="results-badge bg-primary-500 left-8 rounded-full px-1 text-white text-xs whitespace-nowrap">{facetFilters.length}</span>}</h2>
                {(facetFilters.length > 0 || fulltext == 'on') && <div className="flex flex-col">
                
                <div className="flex flex-wrap gap-2 py-2 border-b border-neutral-200">
                <ActiveFilters showDatasets={false}/>
                </div>
                </div>}
                <FacetSection/> 
                </>
                
            }
            { /* drawerContent == 'cadastre' && 
                <CadastralSubdivisions dataset={dataset} doc={doc} childrenData={childrenData} landingPage={false}/>
             */}
            { drawerContent == 'tree' &&
                <TreeResults/>
            }
            </div>
            </>
            }

<div className="absolute left-1 z-[2000] right-0 flex flex-col gap-2">
</div>
            
            <div className="fixed bottom-0 left-0 bg-neutral-800 text-white w-full h-12 p-1 flex items-center justify-between">
                <button aria-label="Datasett" onClick={() => switchTab('datasets')} aria-current={(drawerContent && ["datasetInfo", "datasets"].includes(drawerContent)) ? 'page' : 'false'} className="toolbar-button">
                    <div className="relative">
                        <PiDatabase className="text-3xl" />
                        {datasetCount > 0 && <span className={`results-badge bg-primary-500 absolute -top-1 left-full -ml-2 rounded-full text-white text-xs ${datasetCount < 10 ? 'px-1.5' : 'px-1'}`}>
                            {formatNumber(datasetCount)}
                        </span>}
                    </div>
                </button>

                {treeSettings[perspective] && <button aria-label='Register' onClick={() => switchTab('tree')} aria-current={drawerContent == 'tree' ? 'page' : 'false'} className="toolbar-button">
                    <PiTreeViewFill className="text-3xl" />
                </button>}

                {<button aria-label="Filtre" onClick={() => switchTab('filters')} aria-current={drawerContent == 'filters' || drawerContent == 'adm' ? 'page' : 'false'} className="toolbar-button">
                    <div className="relative">
                        <PiFunnel className="text-3xl" />
                        {facetFilters.length > 0 && <span className={`results-badge bg-primary-500 absolute -top-1 left-full -ml-2 rounded-full text-white text-xs ${facetFilters.length < 10 ? 'px-1.5' : 'px-1'}`}>
                            {facetFilters.length}
                        </span>}
                    </div>
                </button>}

                {mode == 'map' && searchFilterParamsString &&
                    <button aria-label='Søkeresultater'
                        onClick={() => switchTab('results')}
                        aria-current={drawerContent == 'results' ? 'page' : 'false'}
                        className="toolbar-button">
                        <div className="relative">
                            <PiListBullets className="text-3xl" />
                            <span className={`results-badge bg-primary-500 absolute -top-1 left-full -ml-2 rounded-full text-white text-xs ${totalHits && totalHits.value < 10 ? 'px-1.5' : 'px-1'}`}>
                                {totalHits && formatNumber(totalHits.value)}
                            </span>
                        </div>
                    </button>}

                {doc && <button aria-label="Oppslag" onClick={() => switchTab('info')} aria-current={drawerContent == 'info' ? 'page' : 'false'} className="toolbar-button">
                    <PiBookOpen className="text-3xl" />
                </button>}


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