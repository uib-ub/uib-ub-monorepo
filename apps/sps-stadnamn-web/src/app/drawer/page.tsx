'use client'
import { useRef, useState } from "react"
import { PiFunnel, PiInfoFill, PiTable, PiTreeView } from "react-icons/pi";

export default function Drawer() {
    const [currentPosition, setCurrentPosition] = useState(25); // Example initial value
    const [snappedPosition, setSnappedPosition] = useState(25); // Example initial value
    const [snapped, setSnapped] = useState(false);
    const [startTouchY, setStartTouchY] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<null | 'up' | 'down'>(null);
    const scrollableContent = useRef<HTMLDivElement>(null);

        
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
        

    return <div className="h-full">
        <div className="bg-accent-200 !h-full">
            Kart

        
            
            </div>
        

        <div className={`bg-white fixed overscroll-none touch-pan-down overflow-hidden md:!h-full md:!w-full md:bg-transparent bottom-0 w-full  ${snapped ? 'transition-all duration-300 ease-in-out ' : ''}`}
             style={{height: `${currentPosition}dvh`, touchAction: snappedPosition == 100 ? 'pan-y' : 'pan-down'}}
             onTouchStart={handleTouchStart} 
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}>

            <div className="w-full flex justify-center md:hidden"><div className="h-1 w-16 bg-neutral-300 mt-1 rounded-full"></div></div>
            <div className="h-full overscroll-contain max-h-[calc(100dvh-3rem)] p-4 instance-info" ref={scrollableContent} style={{overflowY: snappedPosition == 100 ? 'auto' : 'hidden', touchAction: snappedPosition == 100 || scrollableContent.current?.scrollTop && scrollableContent.current.scrollTop > 0 ? 'pan-y' : 'pan-down'}}>
            <h2>Berg</h2>
            <p>Gard | Ullensvang, Hordaland</p>

            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Aenam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p>
            <p>Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.</p>
            <p>Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p>
            <p>Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.</p>
            <p>Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p>
            <p>Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Aenam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p>
            <p>Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.</p>
            <p>Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p>
            <p>Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.</p>
            <p>Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p>
            <p>Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.</p>

            
            </div>
            <div className="fixed bottom-0 left-0 bg-neutral-800 text-white w-full h-12 flex gap-2 py-1 px-4 items-center justify-between shadow-md">
                <div className="flex gap-2 font-semibold">Treff<span className="bg-primary-500 rounded-full px-2 text-white whitespace-nowrap">10 000+</span></div>
                <div className="flex">
                <div className="px-3"><PiFunnel className="text-3xl"/></div>
                <div className="px-3"><PiTable className="text-3xl"/></div>
                <div className="px-3"><PiTreeView className="text-3xl"/></div>
                <div className="px-3"><PiInfoFill className="text-3xl"/></div>
                </div>
              

            </div>
            
        </div>
    </div>
}