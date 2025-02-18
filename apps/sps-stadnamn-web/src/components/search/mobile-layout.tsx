'use client'
import { useContext, useEffect, useRef, useState } from "react"
import { PiBinocularsFill, PiBookOpen, PiDatabase, PiDatabaseFill, PiFunnel, PiFunnelFill, PiInfoFill, PiListBullets, PiTreeViewFill } from "react-icons/pi";
import Results from "./results/search-results";
import MapExplorer from "./map-explorer";
import { useQueryState } from "nuqs";
import { useDataset, useSearchQuery } from "@/lib/search-params";
import Facets from "./facets/facet-section";
import StatusSection from "./status-section";
import { SearchContext } from "@/app/search-provider";
import CadastralSubdivisions from "../children/cadastral-subdivisions";
import TreeResults from "./results/tree-results";
import DatasetDrawer from "./datasets/dataset-drawer";
import TableExplorer from "./table/table-explorer";
import { treeSettings } from "@/config/server-config";
import { useSearchParams } from "next/navigation";
import ListExplorer from "./list/list-explorer";
import { ChildrenContext } from "@/app/children-provider";
import { DocContext } from "@/app/doc-provider";
import DocInfo from "./info/doc-info";
import DocSkeleton from "./info/doc-skeleton";
import ChildrenWindow from "../children/children-window";

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
    const { searchFilterParamsString } = useSearchQuery()
    const { totalHits, isLoading } = useContext(SearchContext)
    const [facetIsLoading, setFacetIsLoading] = useState(false)
    const [ showLoading, setShowLoading ] = useState<boolean>(false)
    const mode = useQueryState('mode', {defaultValue: 'map'})[0]
    const dataset = useDataset()
    const parent = searchParams.get('parent')
    const { childrenCount, shownChildrenCount } = useContext(ChildrenContext)
    const { parentData, docLoading } = useContext(DocContext)
    const { preferredTabs } = useContext(GlobalContext)



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



    const swtichTab = (tab: string) => {

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

        
        

        <div className={`mobile-interface fixed bottom-12 w-full rounded-t-xl bg-neutral-900  ${snapped ? 'transition-all duration-300 ease-in-out ' : ''}`}
             style={{height: `${drawerContent ? currentPosition : 0}svh`}}
             onTouchStart={handleTouchStart} 
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}>
        { drawerContent && <>
            <div className="w-full flex  items-center h-8 pt-2 rounded-t-xl bg-neutral-900 relative px-2" style={{touchAction: 'none'}}>
                <h2 className="sr-only">
                    {drawerContent == 'results' && 'Treff'}
                    {drawerContent == 'datasets' && 'Datasett'}
                    {drawerContent == 'filters' && 'Avgrens'}
                    {drawerContent == 'tree' && 'Register'}
                    {drawerContent == 'info' && 'Oppslag'}
                    
                </h2>
                <div className="absolute -translate-x-1/2 left-1/2 h-2 top-2 w-16 bg-neutral-300 rounded-full"></div></div>
            <div className={`h-full bg-white flex flex-col mobile-padding rounded-lg shadow-inner border-4 border-neutral-900 shadow-inner max-h-[calc(100svh-12rem)] overscroll-contain pt-2`} ref={scrollableContent} style={{overflowY: currentPosition == 75 ? 'auto' : 'hidden', touchAction: (currentPosition == 75 && isScrollable()) ? 'pan-y' : 'none'}}>

            {drawerContent == 'info' && <>
            {!parent && (docLoading ? <DocSkeleton/> : <DocInfo/>)}
            {parent && <ChildrenWindow/>}
            </>}
            { drawerContent == 'results' && 
                <section className="flex flex-col gap-2">
                <Results/>
                </section>
            
             }
            { drawerContent == 'datasets' && <DatasetDrawer/> }
            { drawerContent == 'filters' && 
                <Facets/> 
            }
            { drawerContent == 'cadastre' && 
                <CadastralSubdivisions/>
            }
            { drawerContent == 'tree' &&
                <TreeResults/>
            }
            </div>
            </>
            }

<div className="absolute left-1 z-[2000] right-0 flex flex-col gap-2">
</div>
            
            <div className="fixed bottom-0 left-0 bg-neutral-900 text-white w-full h-12 p-1 flex items-center justify-between">
                    {mode == 'map' && searchFilterParamsString &&  
                        <button aria-label='Søkeresultater' 
                                onClick={() => swtichTab('results')} 
                                aria-current={drawerContent == 'results' ? 'page' : 'false'} 
                                className="toolbar-button">
                                    <PiListBullets className="text-3xl"/><span className="results-badge bg-primary-500 left-8 rounded-full px-1 text-white text-xs whitespace-nowrap">{totalHits && totalHits?.value >= 10000 ? `${Math.round(totalHits.value/1000)}k` : totalHits?.value || '0'}</span></button>}
                    {treeSettings[dataset] && <button aria-label='Register' onClick={() => swtichTab('tree')} aria-current={drawerContent == 'tree' ? 'page' : 'false'} className="toolbar-button"><PiTreeViewFill className="text-3xl"/></button>}

                    {doc && <button aria-label="Informasjon" onClick={() => swtichTab('info')} aria-current={drawerContent == 'info' ? 'page' : 'false'} className="toolbar-button"><PiBookOpen className="text-3xl"/></button>}
                    { <button aria-label="Filtre" onClick={() => swtichTab('filters')} aria-current={drawerContent == 'filters' ? 'page' : 'false'}  className="toolbar-button"><PiFunnel className="text-3xl"/></button>}
                    <button aria-label="Datasett" onClick={() => swtichTab('datasets')} aria-current={drawerContent == 'datasets' ? 'page' : 'false'} className="toolbar-button"><PiDatabase className="text-3xl"/></button>

            </div>
            
        </div>

        <div className={`absolute top-12 right-0 w-full bg-transparent rounded-md z-[1000] ${mode == 'map' ? '' : 'max-h-[calc(100svh-6rem)] h-full overflow-y-auto stable-scrollbar'}`}>
        <StatusSection/>
        { (mode == 'table' || (mode=='doc' && preferredTabs[dataset] == 'table')) && <TableExplorer/>}
        { (mode == 'list' || (mode=='doc' && preferredTabs[dataset] == 'list')) && <ListExplorer/>}
        </div>

        <div className="absolute top-12 right-0 bottom-0 max-h-[calc(100svh-6rem)] w-full bg-white rounded-md">
        { mode == 'map' && <MapExplorer/>}
        </div>


    </div>
}