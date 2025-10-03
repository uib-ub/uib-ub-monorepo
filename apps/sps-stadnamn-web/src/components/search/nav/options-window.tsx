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
        return <div className="">
                                <div className="flex flex-wrap gap-2 py-2"><ActiveFilters /></div>
                                <FacetSection />
                            </div>
    }





    return <div>OptionsWindow</div>
}
