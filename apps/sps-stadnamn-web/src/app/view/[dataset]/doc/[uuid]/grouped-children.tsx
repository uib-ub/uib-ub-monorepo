
import { fetchChildrenGrouped } from '@/app/api/_utils/actions'
import ErrorMessage from '@/components/ErrorMessage'
import { datasetTitles } from '@/config/metadata-config'
import { resultRenderers } from '@/config/result-renderers'
import AudioButton from '@/components/results/audioButton'
import CoordinateButton from '@/components/results/coordinateButton'
import ImageButton from '@/components/results/imageButton'
import InfoButton from '@/components/results/infoButton'
import ExternalLinkButton from '@/components/results/externalLinkButton'


export default async function GroupedChildren({ childIdentifiers }: { childIdentifiers: string[]}) {
    const groupedChildren = await fetchChildrenGrouped(childIdentifiers)

    // How doc can be retrieved from index name:
    

    if (groupedChildren.error) {
      return <ErrorMessage error={groupedChildren} message="Kunne ikke hente attestasjoner"/>
    }

    const resultsRenderer = (hits: Record<string, any>, dataset: string) => {
        
        return (
        <ul>
            {hits.hits.map((hit: Record<string, any>, index: number) => (
              
                <li key={index} className='list-none list'>
                    {resultRenderers[dataset].title(hit)}{(hit.sosi || hit.type) && <span> - ({hit.sosi || hit.type})</span>}

                  {hit._source.image && <ImageButton hit={hit}/>}
                  
                  {hit._source.audio &&
                    <AudioButton audioFile={`https://iiif.test.ubbe.no/iiif/audio/${dataset}/${hit._source.audio.file}` } 
                                className="text-xl xl:text-3xl text-neutral-700"/> 
                  }
                  {hit._source.link && <ExternalLinkButton hit={hit}/>}
                  {hit._source.location && <CoordinateButton hit={hit}/>}
                  <InfoButton hit={hit}/>
                    
                </li>
            ))}
            </ul>

        )
    }

    return (
        <> 
        <h3>Attestasjoner</h3>
          {groupedChildren.map((dataset: Record<string, any>, index: number) => (
            <div key={index}>
              <h4>{datasetTitles[dataset.key.split("-")[1]]}</h4>
                { resultsRenderer(dataset.top_docs.hits, dataset.key.split("-")[1])}
            </div>
          ))}
        </>
    )
}