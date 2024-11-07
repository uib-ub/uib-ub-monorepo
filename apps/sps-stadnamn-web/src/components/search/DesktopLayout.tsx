'use client'
import Results from "./resultSection/Results"
import MapExplorer from "./MapExplorer"
import { useQueryState, useQueryStates } from "nuqs"
import { useState } from "react"
import InfoContent from "./infoSection/InfoContent"
import { PiXBold } from "react-icons/pi"
import { useSearchQuery } from "@/lib/search-params"
import StatusSection from "./StatusSection"


export default function DesktopLayout() {

    const { searchFilterParamsString } = useSearchQuery()
    const [doc, setDoc] = useQueryState('doc')
    const [point, setPoint] = useQueryState('point')
    const [expanded, setExpanded] = useQueryState('expanded', {history: 'push'})
    const selectedDocState = useState<any | null>(null)

    const toggleExpanded = (panel: 'options' | 'filters' | 'results') => {
        if (expanded == panel) {
            setExpanded(null)
        }
        else {
            setExpanded(panel)
        }
    }
    
    return <main id="main" className="relative w-full h-[calc(100svh-3rem)]">   
        <div className="absolute top-0 left-[25svw] max-w-[50svw] z-[2000] right-0 flex flex-col gap-2"><StatusSection isMobile={false}/></div>
        
        <div className="flex gap-4 flex-col max-h-[90svh] lg:max-h-full w-[40svw] lg:w-full overflow-y-auto lg:overflow-y-hidden bg-white rounded-md lg:bg-none shadow-md lg:shadodw-none">

        <div className="lg:absolute left-0 top-0 p-2 flex flex-col gap-2 lg:max-h-[90svh] w-[40svw] lg:w-[25svw] !z-[3001]">
        <section aria-labelledby="filter-title" className="lg:bg-white rounded-md lg:shadow-md break-words">
            <h2 id="filter-title"  className="p-4 w-full"><button className="w-full flex justify-start"aria-controls="filter-content" aria-expanded={expanded == 'filters'} onClick={() => toggleExpanded('filters')}>Filtre</button></h2>
            { expanded == 'filters' &&
            <div id="filter-content" className="lg:max-h-[40svh] xl:max-h-[60svh] lg:overflow-y-auto">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                
            </div>
        }
        </section>
        { searchFilterParamsString &&
        <section aria-labelledby="results-title" className="lg:bg-white rounded-md lg:shadow-md break-words">
            <div id="result-content" className="lg:max-h-[40svh] xl:max-h-[60svh] lg:overflow-y-auto">
                <Results/>
            </div>
            
        </section>
        }
        </div>
        <div className="placeholder:info-section lg:absolute right-0 top-0 p-2 flex flex-col gap-2 lg:max-h-[80svh] w-[40svw] lg:w-[25svw] !z-[3001]">
        
        <div className="lg:bg-white relative rounded-md lg:shadow-md break-words px-8 pt-8 pb-4 overflow-y-auto">
            { (doc || point) && <button className="absolute right-2 top-2" onClick={() => { setDoc(null); setPoint(null)} } aria-label="lukk"><PiXBold className="text-2xl text-neutral-600" aria-hidden={true}/></button>}
            <InfoContent expanded={expanded == 'info'} selectedDocState={selectedDocState}/>
        </div>
        </div>


        </div>

        <div className="lg:absolute bottom-top right-0 lg:h-full w-full">
        <MapExplorer isMobile={false} selectedDocState={selectedDocState}/>
        </div>


    </main>

}