
import { fetchDoc } from '@/app/api/_utils/actions'
import { datasetTitles } from '@/config/metadata-config'
import { resultRenderers } from '@/config/result-renderers'
import { defaultResultRenderer } from '@/config/result-renderers'

export default async function Sources({ uuids }: { uuids: string[]}) {

    const children = await fetchDoc({uuid: uuids})

    const groupedSources = children.reduce((acc: Record<string, any[]>, source: any) => {
      const docDataset = source._index.split("-")[2]
      if (!acc[docDataset]) {
        acc[docDataset] = []
      }
      acc[docDataset].push(source)
      return acc
    }, {})

    const multivalue = (value: string|string[]) => {
      return Array.isArray(value) ? value.join("/") : value
    }

    return <div>
    {Object.entries(groupedSources).map(([docDataset, hits]) => {
    
      const detailsRenderer = resultRenderers[docDataset]?.details || defaultResultRenderer.details
      const titleRenderer = resultRenderers[docDataset]?.title || defaultResultRenderer.title


        return <div key={docDataset}>
            <h3>{datasetTitles[docDataset]}</h3>
            <ul className="flex flex-wrap gap-2 list-none border border-neutral-200 rounded-lg p-2">
                {(hits as any[]).map((hit: any, index: number) => (
                    <li key={index}>{JSON.stringify(hit._source)}
                    
                    </li>
                ))}
            </ul>
        </div>
    })}
    </div>  
   

       
}