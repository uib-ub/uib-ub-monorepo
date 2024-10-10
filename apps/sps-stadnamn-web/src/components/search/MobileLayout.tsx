'use client'
import { useRef, useState } from "react"
import { PiFunnelFill, PiInfoFill, PiListBullets, PiListMagnifyingGlass } from "react-icons/pi";
import Results from "./Results";
import MapExplorer from "./MapExplorer";
import { useQueryState } from "nuqs";
import Options from "./Options";
import InfoContent from "./infoSection/InfoContent";

export default function MobileLayout() {
    const [currentPosition, setCurrentPosition] = useState(25);
    const [snappedPosition, setSnappedPosition] = useState(25);
    const [snapped, setSnapped] = useState(false);
    const [startTouchY, setStartTouchY] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<null | 'up' | 'down'>(null);
    const scrollableContent = useRef<HTMLDivElement>(null);
    const [startTouchTime, setStartTouchTime] = useState<number>(0);
    const [drawerContent, setDrawerContent] = useQueryState('expanded', {history: 'push'});

    const isScrolling = (target: EventTarget) => {
        if (snappedPosition == 100 && target instanceof Node && scrollableContent.current?.contains(target)) {
            return scrollableContent.current.scrollTop != 0
        }
    }


    const pos2svh = (yPos: number) => {
        const windowHeight = window.visualViewport?.height || window.innerHeight;
        return (windowHeight - yPos) / windowHeight * 100
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
                newPosition = 100
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
            else if (newPosition == 75) {
                newPosition = swipeDirection == 'up' ? 100 : 50
            }
            else if (newPosition > 100) {
                newPosition = 100
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
        setCurrentPosition(newHeight < 100 ? newHeight : 100);

    }

    const swtichTab = (tab: string) => {

        if (drawerContent == tab) {
            setDrawerContent(null)
        }
        else {
            setDrawerContent(tab)

        }

    }




    return <div className="">
        
        

        <div className={`mobile-interface bg-white fixed overscroll-none touch-pan-down overflow-hidden bottom-0 w-full  ${snapped ? 'transition-all duration-300 ease-in-out ' : ''}`}
             style={{height: `${drawerContent ? currentPosition : 0}svh`}}
             onTouchStart={handleTouchStart} 
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}>
        { drawerContent && <>
            <div className="w-full flex justify-center"><div className="h-1 w-16 bg-neutral-300 mt-1 rounded-full"></div></div>
            <div className="h-full overscroll-contain max-h-[calc(100svh-3rem)] p-4" ref={scrollableContent} style={{overflowY: currentPosition == 100 ? 'auto' : 'hidden', touchAction: currentPosition == 100  && scrollableContent.current?.scrollTop && scrollableContent.current.scrollTop > 0 ? 'pan-y' : 'pan-down'}}>

            { drawerContent == 'info' && <InfoContent expanded={snappedPosition > 25}/> }
            { drawerContent == 'results' && <Results/> }
            { drawerContent == 'options' && <Options isMobile={true}/> }
            
            </div>
            </>
            }
            <div className="fixed bottom-0 left-0 bg-neutral-900 text-white w-full h-12 flex items-center justify-between">
                    <button onClick={() => swtichTab('results')} aria-current={drawerContent == 'results' ? 'page' : 'false'} className="toolbar-button"><PiListBullets className="text-3xl"/><span className="results-badge bg-primary-500 left-8 rounded-full px-1 text-white text-xs whitespace-nowrap">10 000+</span></button>
                    <button aria-label="Informasjon" onClick={() => swtichTab('info')} aria-current={drawerContent == 'info' ? 'page' : 'false'} className="toolbar-button"><PiInfoFill className="text-3xl"/></button>
                    <button aria-label="Filtre" className="toolbar-button"><PiFunnelFill className="text-3xl"/></button>
                    <button aria-label="Søkealternativer" onClick={() => swtichTab('options')} aria-current={drawerContent == 'options' ? 'page' : 'false'} className="toolbar-button"><PiListMagnifyingGlass className="text-3xl"/></button>

            </div>
            
        </div>

        <div className="absolute top-12 right-0 h-[calc(100svh-6rem)] w-full">
        <MapExplorer isMobile={true}/>
        </div>

    </div>
}