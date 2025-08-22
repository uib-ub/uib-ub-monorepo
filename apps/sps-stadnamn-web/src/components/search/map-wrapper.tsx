import { useEffect, useState } from "react";
import MapExplorer from "./map-explorer";

export default function MapWrapper() {

    const [containerDimensions, setContainerDimensions] = useState<{width: number, height: number}>()

    useEffect(() => {
        const updateDimensions = () => {
            // Calculate dimensions based on viewport and computed rem value
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Get the computed value of 3rem in pixels
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const headerHeight = rootFontSize * 3; // 3rem in actual pixels
            
            setContainerDimensions({width: viewportWidth, height: viewportHeight - headerHeight});
        };
    
        // Set initial dimensions
        updateDimensions();
        
        // Add resize listener
        window.addEventListener('resize', updateDimensions);
        
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    if (!containerDimensions) {
        return <div>Loading...</div>
    }

    return <MapExplorer containerDimensions={containerDimensions}/>


}
    
