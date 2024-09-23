'use client'
import { useState } from "react"

export default function Drawer() {
    const [drawerPosition, setDrawerPosition] = useState(25); // Example initial value
    const [startTouchY, setStartTouchY] = useState(0);

    const drawerStyle = {
        height: `${drawerPosition}svh` // Set height as a percentage of the viewport height
    };

    const handleTouchStart = (e) => {
        e.preventDefault();
        setStartTouchY(e.touches[0].clientY);
    };

    const handleTouchEnd = (e) => {
        e.preventDefault(); 
        const endTouchY = e.changedTouches[0].clientY;
        // If swipe up, open the drawer more, if swipe down, close the drawer
        if (startTouchY > endTouchY + 10) { // Swipe up
            setDrawerPosition(100); // Max 90vh
        } else if (startTouchY < endTouchY - 10) { // Swipe down
            setDrawerPosition(25);
        }
    };

    return <div>
        <div className="bg-primary-400 w-full h-full relative"></div>
        { drawerPosition > 10 ? <button onClick={() => setDrawerPosition(10)}>Close drawer</button>
        : <button onClick={() => setDrawerPosition(50)}>Open drawer</button>
        }

        <div className="bg-neutral-200 absolute bottom-0 left-0 w-full transition-all duration-300 ease-in-out touch-pan-down" 
             style={drawerStyle} 
             onTouchStart={handleTouchStart} 
             onTouchEnd={handleTouchEnd}>
            <div className="w-full flex justify-center"><div className="h-2 w-20 bg-neutral-700 mt-2 rounded-full"></div></div>
        </div>
    </div>
}