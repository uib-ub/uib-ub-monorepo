'use client'
import Results from "./resultSection/Results"
import MapExplorer from "./MapExplorer"
import { useQueryState } from "nuqs"
import { useContext, useEffect, useState } from "react"
import InfoContent from "./infoSection/InfoContent"
import { PiCaretDownBold, PiCaretUpBold, PiXBold } from "react-icons/pi"
import { useSearchQuery } from "@/lib/search-params"
import StatusSection from "./StatusSection"
import Facets from "./facetSection/Facets"
import { SearchContext } from "@/app/map-search-provider"
import Spinner from "../svg/Spinner"


export default function DesktopLayout() {
    const { searchFilterParamsString } = useSearchQuery()
    const [doc, setDoc] = useQueryState('doc')
    const [point, setPoint] = useQueryState('point')
    const [expanded, setExpanded] = useQueryState('expanded', {history: 'push'})
    const selectedDocState = useState<any | null>(null)
    const { totalHits, isLoading} = useContext(SearchContext)

    // Keep filters or expanded open when switching to a different section
    const [expandedSection, setExpandedSection] = useState<string | null>(expanded === 'results' ? 'results' : expanded === 'filters' ? 'filters' : null)

    const [ showLoading, setShowLoading ] = useState<boolean>(true)

    useEffect(() => {
        if (expanded === 'results') {
            setExpandedSection('results')
        }
        else if (expanded === 'filters') {
            setExpandedSection('filters')
        }

    }, [expanded])



    useEffect(() => {
      if (!isLoading) {
        setTimeout(() => {
          setShowLoading(false)
        }, 100);
      }
      else {
        setShowLoading(true)
      }
    }
    , [isLoading])


    const toggleExpanded = (panel: 'options' | 'filters' | 'results') => {
        
        if (expanded == panel) {
            setExpanded(null)
            setExpandedSection(null)
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
            <h2 id="filter-title"  className="px-2 py-2 w-full">
                <button className="w-full flex justify-start text-center h-full font-semibold text-neutral-950" aria-controls="filter-content" aria-expanded={expandedSection == 'filters'} onClick={() => toggleExpanded('filters')}>
                { expandedSection == 'filters' ? <PiCaretUpBold className="inline self-center mr-1 text-primary-600"/> : <PiCaretDownBold className="inline self-center mr-1  text-primary-600"/> }
                Filtre</button></h2>
            { expandedSection == 'filters' &&
            <div id="filter-content" className="lg:max-h-[40svh] xl:max-h-[60svh] lg:overflow-y-auto">
                <Facets/>
            </div>
        }
        </section>
        { searchFilterParamsString &&
        <section aria-labelledby="results-title" className="lg:bg-white rounded-md lg:shadow-md break-words">
             <h2 id="filter-title"  className="px-2 py-2 w-full"><button className="w-full flex gap-2 justify-start text-center h-full font-semibold text-neutral-950"aria-controls="result-content" aria-expanded={expanded == 'results'} onClick={() => toggleExpanded('results')}>
                { expandedSection == 'results' ? <PiCaretUpBold className="inline self-center  text-primary-600"/> : <PiCaretDownBold className="inline self-center  text-primary-600"/> }
                Treff
                { showLoading ? <Spinner status="Laster søkeresultater" className='inline w-[1em] h-[1em}'/> : <span className='inline self-center text-sm bg-neutral-100 rounded-full px-2'>{ (totalHits?.value || '0')  + (totalHits?.value == 10000 ? "+" : '')}</span> }
                </button>
                
                
                
                </h2>
                { expandedSection == 'results' &&
            <div id="result-content" className="lg:max-h-[50svh] xl:max-h-[60svh] lg:overflow-y-auto border-t border-neutral-200">
                <Results isMobile={false}/>
            </div>
            
            }
            
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