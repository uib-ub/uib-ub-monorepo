'use client'
import { useEffect, useState } from "react";
import MapExplorer from "./map-explorer";
import Spinner from "../svg/Spinner";
import ErrorMessage from "../error-message";
import useSearchData from "@/state/hooks/search-data";

export default function MapWrapper() {

    const [containerDimensions, setContainerDimensions] = useState<{width: number, height: number}>()
    const { searchData, searchError } = useSearchData()

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

    let content;


    if (searchData && containerDimensions) content =  <MapExplorer containerDimensions={containerDimensions}/>
    else if (searchError) content = <div className="p-4"><ErrorMessage error={searchData} message="Kunne ikkje laste kartet"/></div>
    else content = <div className="flex items-center h-full justify-center bg-neutral-100"><Spinner className="h-32 w-32" status="Lastar kart"/></div>


    return content
}
