import { SearchContext } from "@/app/simple-search-provider"
import { useContext } from "react"


export default function Results() {
    const { resultData } = useContext(SearchContext)
    return <div>

        <p>Her kommer resultatene</p>
        { resultData?.hits.hits.map((hit: any) => {
                    return <div key={hit._id}>
                        <h2>{hit._source.label}</h2>
                    </div>
                })


        }

        
    </div>
}
