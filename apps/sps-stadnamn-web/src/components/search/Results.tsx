import { SearchContext } from "@/app/simple-search-provider"
import { useContext } from "react"


export default function Results() {
    const { resultData, isLoading, searchError } = useContext(SearchContext)
    return <div>

        <p>Her kommer resultatene</p>
        {
            isLoading ? <p>Laster...</p> :
            searchError ? <p>Noe gikk galt</p> :
            resultData ? resultData.hits.hits.map((hit: any) => {
                    return <div key={hit._id}>
                        <h2>{hit._source.label}</h2>
                    </div>
                })
            : null

        }

        
    </div>
}
