'use client'
import Results from "./Results"
import MapExplorer from "./MapExplorer"
import { useQueryState } from "nuqs"
import { useContext, useState } from "react"
import { SearchContext } from "@/app/simple-search-provider";
import { datasetTitles } from "@/config/metadata-config"
import { useSearchParams } from "next/navigation"
import InfoContent from "./infoSection/InfoContent"
import { PiX, PiXBold } from "react-icons/pi"


export default function DesktopLayout() {

    const { resultData } = useContext(SearchContext)
    const searchParams = useSearchParams()
    const [doc, setDoc] = useQueryState('doc')
    const [point, setPoint] = useQueryState('point')


    const [expanded, setExpanded] = useQueryState('expanded', {history: 'push'})

    const toggleExpanded = (panel: 'options' | 'filters' | 'results') => {
        if (expanded == panel) {
            setExpanded(null)
        }
        else {
            setExpanded(panel)
        }
    }
    
    return <main id="main" className="relative w-full h-[calc(100svh-3rem)]">        
        <div className="flex gap-4 flex-col max-h-[90svh] lg:max-h-full w-[40svw] lg:w-full overflow-y-auto lg:overflow-y-hidden bg-white rounded-md lg:bg-none shadow-md lg:shadodw-none">

        <div className="lg:absolute left-0 top-0 p-4 flex flex-col gap-2 lg:max-h-[90svh] w-[40svw] lg:w-[25svw] !z-[3001]">
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
        { resultData?.hits.total &&
        <section aria-labelledby="results-title" className="lg:bg-white rounded-md lg:shadow-md break-words">
            <h2 id="result-title" className="p-4 w-full"><button className="w-full flex justify-start"aria-controls="result-content" aria-expanded={expanded == 'results'} onClick={() => toggleExpanded('results')}>Treff</button></h2>
            { expanded == 'results' &&
            <div id="result-content" className="lg:max-h-[40svh] xl:max-h-[60svh] lg:overflow-y-auto">
                <Results />
            </div>
        }
            
        </section>
        }
        </div>
        <div className="placeholder:info-section lg:absolute right-0 top-0 p-4 flex flex-col gap-2 lg:max-h-[80svh] w-[40svw] lg:w-[25svw] !z-[3001]">
        
        <div className="lg:bg-white relative rounded-md lg:shadow-md break-words px-8 pt-8 pb-4 overflow-y-auto">
            { doc && <button className="absolute right-2 top-2" onClick={() => setDoc(null)} aria-label="lukk"><PiXBold className="text-2xl text-neutral-600" aria-hidden={true}/></button>}
            { point && <button className="absolute right-2 top-2" onClick={() => setPoint(null)} aria-label="lukk"><PiXBold className="text-2xl text-neutral-600" aria-hidden={true}/></button>}
            <InfoContent expanded={expanded == 'info'}/>
        </div>
        </div>


        </div>

        <div className="lg:absolute bottom-top right-0 lg:h-full w-full">
        <MapExplorer isMobile={false}/>
        </div>


    </main>

}