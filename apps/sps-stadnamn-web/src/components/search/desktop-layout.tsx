'use client'
import SearchResults from "./results/search-results"
import TreeResults from "./results/tree-results"
import MapExplorer from "./map-explorer"
import { useQueryState } from "nuqs"
import { useContext, useEffect, useState } from "react"
import InfoContent from "./info/info-content"
import { PiCaretDownBold, PiCaretUpBold, PiXBold } from "react-icons/pi"
import { useDataset, useSearchQuery } from "@/lib/search-params"
import StatusSection from "./status-section"
import Facets from "./facets/facet-section"
import { SearchContext } from "@/app/map-search-provider"
import Spinner from "../svg/Spinner"
import CadastralSubdivisions from "../doc/cadastral-subdivisions"
import { treeSettings } from "@/config/server-config"
import { DocContext } from "@/app/doc-provider"
import { useSearchParams } from "next/navigation"

export default function DesktopLayout() {

    
    const { searchFilterParamsString } = useSearchQuery()
    const searchParams = useSearchParams()
    const [doc, setDoc] = useQueryState('doc')
    const [point, setPoint] = useQueryState('point')
    const [expanded, setExpanded] = useQueryState('expanded', {history: 'push'})
    const selectedDocState = useState<any | null>(null)
    const { totalHits, isLoading} = useContext(SearchContext)
    const [facetIsLoading, setFacetIsLoading] = useState<boolean>(false)
    const [cadastralUnit, setCadastralUnit] = useQueryState('cadastralUnit')
    const [mode, setMode] = useQueryState('mode', {history: 'push', defaultValue: 'search'})
    const dataset = useDataset()
    

    // Keep filters or expanded open when switching to a different section
    const [expandedSection, setExpandedSection] = useState<string | null>(expanded === 'results' ? 'results' : expanded === 'filters' ? 'filters' : null)

    const [ showLoading, setShowLoading ] = useState<string|null>(null)

    const { docLoading } = useContext(DocContext)

    

    useEffect(() => {
        if (expanded === 'results') {
            setExpandedSection('results')
        }
        else if (expanded === 'filters') {
            setExpandedSection('filters')
            setFacetIsLoading(true)
        }
        else if (window && window.innerWidth < 1024) {
            setExpandedSection(null)
        }

    }, [expanded])



    useEffect(() => {
      if (!isLoading && !facetIsLoading) {
        setTimeout(() => {
          setShowLoading(null)
        }, 100);
      }
      else {
        setShowLoading(expandedSection)
      }
    }
    , [isLoading, expandedSection, facetIsLoading])


    const toggleExpanded = (panel: 'options' | 'filters' | 'results' | 'cadastre') => {
        
        if (expanded == panel) {
            setExpanded(null)
            setExpandedSection(null)
        }
        else {
            setExpanded(panel)
        }
    }

    return <main id="main" className="flex relative w-[100svw] h-[calc(100svh-3rem)] lg:h-[calc(100svh-3rem)]">   
        <div className="absolute top-0 left-[25svw] max-w-[50svw] z-[2000] right-0 flex flex-col gap-2"><StatusSection isMobile={false}/></div>
        
        <div className="flex lg:gap-4 flex-col h-full max-h-full w-[40svw] lg:w-full overflow-y-auto lg:overflow-y-hidden">

        <div className={`lg:absolute left-0 top-0 lg:p-2 flex-col gap-2 lg:max-h-[calc(100svh-4rem)] max-w-[40svw] lg:w-[25svw] !z-[3001] bg-white shadow-md lg:shadow-none rounded-br-md lg:rounded-none lg:bg-transparent 
            ${mode == 'tree' && (expanded == 'info' || expanded == 'cadastre') ? 'hidden lg:flex' : 'flex'}`}>

        { mode == 'search' && <>
        
        <section aria-labelledby="filter-title" className="bg-white lg:rounded-md lg:shadow-md break-words">
            <h2 id="filter-title"  className="px-2 py-2 w-full">
                <button className="w-full flex justify-start text-center h-full font-semibold text-neutral-950" aria-controls="filter-content" aria-expanded={expandedSection == 'filters'} onClick={() => toggleExpanded('filters')}>
                { expandedSection == 'filters' ? <PiCaretUpBold className="inline self-center mr-1 text-primary-600"/> : <PiCaretDownBold className="inline self-center mr-1  text-primary-600"/> }
                Filtre
                { showLoading == 'filters' && <Spinner status="Laster filtre" className='inline w-[1em] h-[1em}'/> }
                </button> 
                
                </h2>
            { expandedSection == 'filters' &&
            <div id="filter-content" className="lg:max-h-[40svh] xl:max-h-[60svh] lg:overflow-y-auto">
                <Facets setFacetIsLoading={setFacetIsLoading}/>
            </div>
        }
        </section> 
        { searchFilterParamsString && 
        <section aria-labelledby="results-title" className="bg-white rounded-md lg:shadow-md break-words">
             <h2 id="filter-title"  className="px-2 py-2 w-full"><button className="w-full flex gap-2 justify-start text-center h-full font-semibold text-neutral-950"aria-controls="result-content" aria-expanded={expanded == 'results'} onClick={() => toggleExpanded('results')}>
                { expandedSection == 'results' ? <PiCaretUpBold className="inline self-center  text-primary-600"/> : <PiCaretDownBold className="inline self-center  text-primary-600"/> }
                Treff
                { showLoading == 'results' ? <Spinner status="Laster søkeresultater" className='inline w-[1em] h-[1em}'/> : <span className='inline self-center text-sm bg-neutral-100 rounded-full px-2'>{ (totalHits?.value || '0')  + (totalHits?.value == 10000 ? "+" : '')}</span> }
                </button>
                
                
                
                </h2>
                { expandedSection == 'results' &&
            <div id="result-content" className="lg:max-h-[50svh] xl:max-h-[60svh] lg:overflow-y-auto border-t border-neutral-200">
                <SearchResults isMobile={false}/>
            </div>
            
            }
            
        </section>
        }
        </>}

        { mode == 'tree' && treeSettings[dataset] &&
            <section aria-labelledby="tree-title" className={`h-full lg:max-h-[calc(100svh-4rem)] overflow-y-auto lg:border-t border-neutral-200 bg-white rounded-md lg:shadow-md ${searchParams.get('adm') ? '' : 'pt-4'}`}>
            <TreeResults isMobile={false}/>
            </section>

        }
        </div>
       
        <div className="lg:absolute right-0 top-0 pb-4 flex flex-col justify-between items-end h-full">
        <div className={`py-2 lg:p-2 flex flex-col gap-2 lg:w-[25svw] !z-[3001] h-full ${cadastralUnit ? 'lg:max-h-[50svh]' :  'lg:max-h-[calc(100svh - 500px)]'} ${(expanded == 'info' || expanded == 'cadastre')? '' : 'hidden lg:flex' }`}>
        <div className={`bg-white relative lg:rounded-md lg:shadow-md break-words p-6 overflow-y-auto stable-scrollbar`}>
            { (doc || point) &&  <button className="absolute right-0 top-2" onClick={() => { setDoc(null); setPoint(null)} } aria-label="lukk"><PiXBold className="text-2xl text-neutral-600" aria-hidden={true}/></button>}
            <InfoContent/>
        </div>
        </div>
        { cadastralUnit && <div className={`lg:p-2 flex-col gap-2 max-w-[40svw] ] !z-[3001]`}>
                <div className="rounded-md shadow-md bg-white max-h-[40svh] overflow-auto">
                    <CadastralSubdivisions isMobile={false}/>
                </div>
            </div>
        }

        </div>
        </div>


        <div className="absolute top-0 right-0 h-full w-[60svw] lg:w-full">
        <MapExplorer isMobile={false}/>
        </div>


    </main>

}