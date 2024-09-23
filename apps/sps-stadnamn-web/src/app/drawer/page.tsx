'use client'
import { useState } from "react"

export default function Drawer() {
    const [currentPosition, setCurrentPosition] = useState(25); // Example initial value
    const [snappedPosition, setSnappedPosition] = useState(25); // Example initial value
    const [snapped, setSnapped] = useState(false);
    const [startTouchY, setStartTouchY] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<null | 'up' | 'down'>(null);

    const drawerStyle = {
        height: `${currentPosition}svh` // Set height as a percentage of the viewport height
    };


    const pos2svh = (yPos: number) => {
        const windowHeight = window.visualViewport?.height || window.innerHeight;
        return (windowHeight - yPos) / windowHeight * 100
    }



    const handleTouchStart = (e) => {
        e.preventDefault();
        setStartTouchY(e.touches[0].clientY);
        setSnapped(false);
    };

    const handleTouchEnd = (e) => {
        e.preventDefault(); 
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
        e.preventDefault();


        const newHeight = snappedPosition - pos2svh(startTouchY) + pos2svh(e.touches[0].clientY)

        setSwipeDirection(newHeight > currentPosition ? 'up' : 'down');
        setCurrentPosition(newHeight < 100 ? newHeight : 100);

  
    }
        

    return <div className="h-full">
        <div className="bg-accent-200 !h-full"><h1>Hello</h1>

        
            
            </div>
        

        <div className={`bg-white absolute md:!h-full md:!w-full md:bg-transparent bottom-0 w-full touch-pan-down ${snapped ? 'transition-all duration-300 ease-in-out ' : ''}`}
             style={drawerStyle} 
             onTouchStart={handleTouchStart} 
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}>

            <div className="w-full flex justify-center md:hidden"><div className="h-1 w-16 bg-neutral-300 mt-1 rounded-full"></div>
            
            </div>
            Snapped position: {snappedPosition}<br/>
            Direction: {swipeDirection}<br/>
            <br/>
            
        </div>
    </div>
}