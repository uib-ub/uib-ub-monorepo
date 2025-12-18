import { useSearchParams } from "next/navigation"
import ActiveFilters from "../form/active-filters"
import ClientFacet from "./facets/client-facet"
import FacetSection from "./facets/facet-section"
import ServerFacet from "./facets/server-facet"
import TreeWindow from "./tree-window"




export default function OptionsWindow() {

    const searchParams = useSearchParams()
    const facet = searchParams.get('facet')
    const tree = searchParams.get('tree')


    // Tree viewer is controlled solely by `tree`
    if (tree) {
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
        return <ServerFacet />
    }
}
