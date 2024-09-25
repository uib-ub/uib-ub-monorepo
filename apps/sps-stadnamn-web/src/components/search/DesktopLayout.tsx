'use client'
import Results from "./Results"
import MapExplorer from "./MapExplorer"
import { useQueryState } from "nuqs"


export default function DesktopLayout() {

    const [expanded, setExpanded] = useQueryState('expanded', {history: 'push'})

    const toggleExpanded = (panel: 'options' | 'filters' | 'results') => {
        if (expanded == panel) {
            setExpanded(null)
        }
        else {
            setExpanded(panel)
        }
    }
    
    return <div className="relative w-full h-[calc(100dvh-3rem)]">
        
        <div className="flex gap-4 flex-col max-h-[90dvh] lg:max-h-full w-[40dvw] lg:w-full overflow-y-auto lg:overflow-y-hidden bg-white rounded-md lg:bg-none shadow-md lg:shadodw-none">

        
        <div className="lg:absolute left-4 top-4 flex flex-col gap-2 lg:max-h-[90dvh] w-[40dvw] lg:w-[25dvw] !z-[3001]">
        <section aria-label="Søk" className="lg:bg-white rounded-md lg:shadow-md">
            <h2 id="search-title"  className="p-4 w-full"><button className="w-full flex justify-start"aria-controls="search-content" aria-expanded={expanded == 'options'} onClick={() => toggleExpanded('options')}>Søk</button></h2>
            { expanded == 'options' &&
                <div id="search-content" className="lg:max-h-[40dvh] xl:max-h-[60dvh] lg:overflow-y-auto">
            
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
            </div>
        }
        </section>
        <section aria-labelledby="filter-title" className="lg:bg-white rounded-md lg:shadow-md break-words">
            <h2 id="filter-title"  className="p-4 w-full"><button className="w-full flex justify-start"aria-controls="filter-content" aria-expanded={expanded == 'filters'} onClick={() => toggleExpanded('filters')}>Filtre</button></h2>
            { expanded == 'filters' &&
            <div id="filter-content" className="lg:max-h-[40dvh] xl:max-h-[60dvh] lg:overflow-y-auto">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                
            </div>
        }
        </section>
        <section aria-labelledby="results-title" className="lg:bg-white rounded-md lg:shadow-md break-words">
            <h2 id="result-title" className="p-4 w-full"><button className="w-full flex justify-start"aria-controls="result-content" aria-expanded={expanded == 'results'} onClick={() => toggleExpanded('results')}>Treff</button></h2>
            { expanded == 'results' &&
            <div id="result-content" className="lg:max-h-[40dvh] xl:max-h-[60dvh] lg:overflow-y-auto">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac purus sit amet nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam. Nullam nec nisl nec nunc fermentum aliquam.</p>
                <Results />
            </div>
        }
            
        </section>
        </div>

        


        <div className="lg:absolute right-4 top-4 flex flex-col gap-2 lg:max-h-[80dvh] w-[40dvw] lg:w-[25dvw] !z-[3001]">
        <article aria-labelledby="doc-title" className="lg:bg-white rounded-md lg:shadow-md break-words instance-info p-8">
            <h2 id="doc-title">Berg</h2>
        </article>
        </div>


        </div>

        <div className="lg:absolute bottom-top right-0 lg:h-full w-full">
        <MapExplorer isMobile={false}/>
        </div>


    </div>

}