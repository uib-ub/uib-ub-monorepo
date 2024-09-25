'use client'
import { useRef, useState } from "react"
import { PiFunnel, PiFunnelFill, PiInfoFill, PiListBullets, PiTable, PiTreeView } from "react-icons/pi";
import Results from "./Results";
import SearchForm from "./SearchForm";
import ExampleContent from "./ExampleContent";
import IconButton from "../ui/icon-button";


export default function MobileLayout() {
    const [currentPosition, setCurrentPosition] = useState(25); // Example initial value
    const [snappedPosition, setSnappedPosition] = useState(25); // Example initial value
    const [snapped, setSnapped] = useState(false);
    const [startTouchY, setStartTouchY] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<null | 'up' | 'down'>(null);
    const scrollableContent = useRef<HTMLDivElement>(null);

    const [drawerContent, setDrawerContent] = useState('info')



        
    const isScrolling = (target) => {
        if (snappedPosition == 100 && scrollableContent.current?.contains(target)) {
            console.log("YES")
            return scrollableContent.current.scrollTop != 0
        }
        console.log("NO")

    }


    const pos2svh = (yPos: number) => {
        const windowHeight = window.visualViewport?.height || window.innerHeight;
        return (windowHeight - yPos) / windowHeight * 100
    }


    const handleTouchStart = (e) => {
        if (isScrolling(e.target)) {
            return
        }

        setStartTouchY(e.touches[0].clientY);
        setSnapped(false);
    };

    const handleTouchEnd = (e) => {
        setSnapped(true);

        let newPosition = Math.round(currentPosition / 25) * 25
        if (newPosition < 25) {
            newPosition = 25
        }
        else if (newPosition == 75) {
            newPosition = swipeDirection == 'up' ? 100 : 50
        }
        else if (newPosition > 100) {
            newPosition = 100
        }


        setCurrentPosition(newPosition);
        setSnappedPosition(newPosition);
        setSwipeDirection(null);


    };

    const handleTouchMove = (e) => {
        if (isScrolling(e.target)) {
            return
        }
        const newHeight = snappedPosition - pos2svh(startTouchY) + pos2svh(e.touches[0].clientY)

        setSwipeDirection(newHeight > currentPosition ? 'up' : 'down');
        setCurrentPosition(newHeight < 100 ? newHeight : 100);

    }

    const swtichTab = (tab) => {

        setCurrentPosition(50)
        setDrawerContent(tab)

    }




    return <div className="h-full">
        <div className="bg-accent-200 !h-full">
            <SearchForm/>
            {drawerContent}

            </div>
        

        <div className={`bg-white fixed overscroll-none touch-pan-down overflow-hidden bottom-0 w-full  ${snapped ? 'transition-all duration-300 ease-in-out ' : ''}`}
             style={{height: `${currentPosition}dvh`, touchAction: snappedPosition == 100 ? 'pan-y' : 'pan-down'}}
             onTouchStart={handleTouchStart} 
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}>

            <div className="w-full flex justify-center"><div className="h-1 w-16 bg-neutral-300 mt-1 rounded-full"></div></div>
            <div className="h-full overscroll-contain max-h-[calc(100dvh-3rem)] p-4 instance-info" ref={scrollableContent} style={{overflowY: snappedPosition == 100 ? 'auto' : 'hidden', touchAction: snappedPosition == 100 || scrollableContent.current?.scrollTop && scrollableContent.current.scrollTop > 0 ? 'pan-y' : 'pan-down'}}>
            
            { drawerContent == 'info' && <ExampleContent expanded={snappedPosition > 25}/> }
            { drawerContent == 'results' && <Results/> }
            
            </div>
            <div className="fixed bottom-0 left-0 bg-neutral-800 text-white w-full h-12 flex items-center justify-between">

                    <button aria-label="Informasjon"onClick={() => swtichTab('info')} aria-current={drawerContent == 'info' ? 'page' : 'false'} className="toolbar-button"><PiInfoFill className="text-3xl"/></button>
                    <button aria-label="Filtre" className="px-3"><PiFunnelFill className="text-3xl"/></button>
                    
                
                <button onClick={() => swtichTab('results')} aria-current={drawerContent == 'results' ? 'page' : 'false'} className="toolbar-button"><PiListBullets className="text-3xl"/><span className="results-badge bg-primary-500 left-8 rounded-full px-1 text-white text-xs whitespace-nowrap">10 000+</span></button>
                
                    <button aria-label="Tabellvisning" className="toolbar-button"><PiTable className="text-3xl"/></button>
                    {true && <button aria-label="Hierarkisk visning" className="px-3"><PiTreeView className="text-3xl"/></button>}
                
                

            </div>
            
        </div>
    </div>
}