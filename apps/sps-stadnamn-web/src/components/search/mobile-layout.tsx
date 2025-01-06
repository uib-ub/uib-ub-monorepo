'use client'
import { useContext, useEffect, useRef, useState } from "react"
import { PiArrowLeft, PiDatabase, PiDatabaseFill, PiFiles, PiFilesFill, PiFunnelFill, PiInfoFill, PiListBullets, PiTreeViewFill, PiX } from "react-icons/pi";
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
import DocInfo from "./info/doc-info";
import { DocContext } from "@/app/doc-provider";
import SourceList from "./results/source-list";
import { ChildrenContext } from "@/app/children-provider";
import Spinner from "../svg/Spinner";
import ParamLink from "../ui/param-link";
import ListExplorer from "./list/list-explorer";
import DocSkeleton from "./info/doc-skeleton";

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

    const selectedDocState = useState<any | null>(null)
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const { searchFilterParamsString } = useSearchQuery()
    const { totalHits, isLoading } = useContext(SearchContext)
    const { docLoading, docData, parentData, parentLoading } = useContext(DocContext)
    const { childrenLoading } = useContext(ChildrenContext)
    const [facetIsLoading, setFacetIsLoading] = useState(false)
    const [ showLoading, setShowLoading ] = useState<boolean>(false)
    const mode = useQueryState('mode', {defaultValue: 'map'})[0]
    const dataset = useDataset()
    const parent = searchParams.get('parent')



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
                <h2 className="uppercase text-base font-semibold font-sans text-neutral-50 tracking-wider">
                    {drawerContent == 'results' && 'Treff'}
                    {drawerContent == 'datasets' && 'Datasett'}
                    {drawerContent == 'filters' && 'Filtre'}
                    {drawerContent == 'tree' && 'Register'}
                    {drawerContent == 'info' ? <>
                        {parent && doc == parent && !treeSettings[dataset] && 'Kilder'}
                        {parent && doc == parent && treeSettings[dataset] && 'Bruk'}
                        {parent && doc != parent && 'Kilde'}
                        {!parent && 'Oppslag'}
                    </> : null}
                    
                </h2>
                <div className="absolute -translate-x-1/2 left-1/2 h-2 top-2 w-16 bg-neutral-300 rounded-full"></div></div>
            <div className={`h-full bg-white flex flex-col mobile-padding rounded-lg shadow-inner border-4 border-neutral-900 shadow-inner max-h-[calc(100svh-3rem)] overscroll-contain pb-5 pt-2`} ref={scrollableContent} style={{overflowY: currentPosition == 75 ? 'auto' : 'hidden', touchAction: (currentPosition == 75 && isScrollable()) ? 'pan-y' : 'none'}}>

            { docLoading && <div className="flex"><DocSkeleton/></div>}
            {doc && !docLoading && docData?._source &&
            <div className={`${drawerContent != 'info' ? 'hidden' : ''}`}>

                {(!parent || doc != parent) && <DocInfo/>}

                 {parent ? 
                    (parentLoading || childrenLoading) ? 

                    <div className="flex justify-center h-24 m-12"><Spinner status={treeSettings[dataset] ? 'Laster garder' : 'Laster kilder'} className="w-full h-full m-2 self-center" /></div>

                
                    :
                
                        <div className={`instance-info ${doc != parent ? '!pt-4 mt-4 pb-4 border-t border-t-neutral-200' : ''}`}>

                        { treeSettings[dataset] ?  
                            parentData?._id && <CadastralSubdivisions isMobile={true}/>
                        :  dataset == 'search' && <>{parent && parent != doc && <h2 className="!text-base font-semibold uppercase !font-sans px-1">Andre kilder</h2>}<SourceList/></>}
                        </div>
                    

                    : null
                }
                    { !docLoading && !childrenLoading && !parentLoading &&
                    <div className="flex flex-col gap-1 py-4 px-2 w-full text-neutral-950">
                    {!parent && treeSettings[dataset] && <ParamLink className="flex p-4 gap-2 w-full rounded-md bg-neutral-50 border border-neutral-200 h-full items-center no-underline" add={{parent: docData?._source?.uuid}}><PiFilesFill className="text-2xl text-primary-600"/>Underordna bruk</ParamLink>}
                    {!parent && docData?._source?.children?.length > 0 && <ParamLink className="flex p-4 gap-2 w-full rounded-md bg-neutral-50 border border-neutral-200 h-full items-center no-underline" add={{parent: docData?._source?.uuid}}><PiFilesFill className="text-2xl text-primary-600"/>Kilder</ParamLink>}
                    {parent && <ParamLink className="flex p-4 gap-2 w-full rounded-md bg-neutral-50 border border-neutral-200 h-full items-center no-underline" remove={['parent']} add={{doc: parent}}><PiArrowLeft className="text-2xl text-primary-600"/>Stedsnavnoppslag</ParamLink>}
                    <ParamLink className="flex p-4 gap-2 w-full rounded-md bg-neutral-50 border border-neutral-200 h-full items-center no-underline" remove={['doc', 'parent']}><PiX className="text-2xl"/>Lukk</ParamLink>
                    </div>
                }



            </div>
            }
            { drawerContent == 'results' && 
                <section className="flex flex-col gap-2">
                <Results isMobile={true}/>
                </section>
            
             }
            { drawerContent == 'datasets' && <DatasetDrawer/> }
            { drawerContent == 'filters' && 
                <Facets/> 
            }
            { drawerContent == 'cadastre' && 
                <CadastralSubdivisions isMobile={true}/>
            }
            { drawerContent == 'tree' &&
                <TreeResults isMobile={true}/>
            }
            </div>
            </>
            }

<div className="absolute left-1 z-[2000] right-0 flex flex-col gap-2">
</div>
            
            <div className="fixed bottom-0 left-0 bg-neutral-900 text-white w-full h-12 p-1 flex items-center justify-between">
                    {mode == 'map' && searchFilterParamsString &&  <button aria-label='Søkeresultater' onClick={() => swtichTab('results')} aria-current={drawerContent == 'results' ? 'page' : 'false'} className="toolbar-button"><PiListBullets className="text-3xl"/><span className="results-badge bg-primary-500 left-8 rounded-full px-1 text-white text-xs whitespace-nowrap">{totalHits?.relation == 'gte' ? '10 000+' : totalHits?.value || '0'}</span></button>}
                    {treeSettings[dataset] && <button aria-label='Register' onClick={() => swtichTab('tree')} aria-current={drawerContent == 'tree' ? 'page' : 'false'} className="toolbar-button"><PiTreeViewFill className="text-3xl"/></button>}

                    {doc && <button aria-label="Informasjon" onClick={() => swtichTab('info')} aria-current={drawerContent == 'info' ? 'page' : 'false'} className="toolbar-button"><PiInfoFill className="text-3xl"/></button>}
                    { <button aria-label="Filtre" onClick={() => swtichTab('filters')} aria-current={drawerContent == 'filters' ? 'page' : 'false'}  className="toolbar-button"><PiFunnelFill className="text-3xl"/></button>}
                    <button aria-label="Datasett" onClick={() => swtichTab('datasets')} aria-current={drawerContent == 'datasets' ? 'page' : 'false'} className="toolbar-button"><PiDatabaseFill className="text-3xl"/></button>

            </div>
            
        </div>

        <div className={`absolute top-12 right-0 w-full bg-transparent rounded-md z-[1000] ${mode == 'map' ? '' : 'max-h-[calc(100svh-6rem)] h-full overflow-y-auto stable-scrollbar'}`}>
        <StatusSection isMobile={true}/>
        { mode == 'table' && <TableExplorer/>}
        { mode == 'list' && <ListExplorer/>}
        </div>

        <div className="absolute top-12 right-0 bottom-0 max-h-[calc(100svh-6rem)] w-full bg-white rounded-md">
        { mode == 'map' && <MapExplorer isMobile={true}/>}
        </div>


    </div>
}