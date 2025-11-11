import { useSearchParams } from "next/navigation"
import FacetSection from "./facets/facet-section"
import ActiveFilters from "../form/active-filters"
import { useSearchQuery } from "@/lib/search-params"
import ClientFacet from "./facets/client-facet"
import ServerFacet from "./facets/server-facet"
import TreeWindow from "./tree-window"




export default function OptionsWindow() {

    const searchParams = useSearchParams()
    const facet = searchParams.get('facet')
    const datasetTag = searchParams.get('datasetTag')


    if (datasetTag == 'tree') {
        return <TreeWindow />
    }
    else if (!facet) {

        return <div className="">
                                <div className="flex flex-wrap gap-2 p-2"><ActiveFilters /></div>
                               <FacetSection />
                            </div>
    }
    else if (facet == 'adm') {
        return <ClientFacet facetName={facet} />
    }
    else {
        return <ServerFacet/>
    }
}
