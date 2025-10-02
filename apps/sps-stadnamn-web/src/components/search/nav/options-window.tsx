import { useSearchParams } from "next/navigation"
import FacetSection from "./facets/facet-section"
import ActiveFilters from "../form/active-filters"
import { useSearchQuery } from "@/lib/search-params"




export default function OptionsWindow() {

    const searchParams = useSearchParams()
    const facet = searchParams.get('facet')
    const datasetTag = searchParams.get('datasetTag')

    const { facetFilters } = useSearchQuery()

    if (datasetTag == 'tree') {
    }
    else if (facet) {
    }
    else {
        return <div className="p-2">
                                <h2 className="text-xl px-1">Søkealternativ {facetFilters.length > 0 && <span className="results-badge bg-primary-500 left-8 rounded-full px-1 text-white text-xs whitespace-nowrap">{facetFilters.length}</span>}</h2>
                                <div className="flex flex-wrap gap-2 py-2"><ActiveFilters /></div>
                                <FacetSection />
                            </div>
    }





    return <div>OptionsWindow</div>
}
