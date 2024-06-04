
import { fetchChildrenGrouped } from '@/app/api/_utils/actions'
import ErrorMessage from '@/components/ErrorMessage'
import { datasetTitles } from '@/config/metadata-config'
import { resultRenderers } from '@/config/result-renderers'


export default async function GroupedChildren({ childIdentifiers }: { childIdentifiers: string[]}) {
    
    const groupedChildren = await fetchChildrenGrouped(childIdentifiers)
    
    // How doc can be retrieved from index name:
    // const docDataset = doc._index.split('-')[1]

    if (groupedChildren.error) {
      return <ErrorMessage error={groupedChildren} message="Kunne ikke hente lokaliteter"/>
    }

    const resultsRenderer = (hits: Record<string, any>, dataset: string) => {
        return (
        <ul>
            {hits.hits.map((hit: Record<string, any>, index: number) => (
                <li key={index} className='list-none list'>
                    {resultRenderers[dataset].title(hit)}{(hit.sosi || hit.type) && <span> - ({hit.sosi || hit.type})</span>}
                    
                </li>
            ))}
            </ul>

  
        )
    }


    return (
        <> 
        <h3>Lokaliteter</h3>
          {groupedChildren.map((dataset: Record<string, any>, index: number) => (
            <div key={index}>
              <h4>{datasetTitles[dataset.key.split("-")[1]]}</h4>
                { resultsRenderer(dataset.top_docs.hits, dataset.key.split("-")[1])}
            </div>
          ))}
        </>
    )
}