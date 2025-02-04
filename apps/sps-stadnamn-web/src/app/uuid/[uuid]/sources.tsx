import { fetchChildren } from '@/app/api/_utils/actions'
import SourceItem from '@/components/children/source-item'
import { datasetTitles } from '@/config/metadata-config'
import { resultRenderers } from '@/config/result-renderers'
import { defaultResultRenderer } from '@/config/result-renderers'
import Link from 'next/link'

export default async function Sources({ uuids }: { uuids: string[] }) {
    const [data, _status] = await fetchChildren({
        uuids: uuids,
        mode: 'list'
    })

    const groupedSources = data.hits.hits.reduce((acc: Record<string, any[]>, source: any) => {
        const docDataset = source._index.split("-")[2]
        if (!acc[docDataset]) {
            acc[docDataset] = []
        }
        acc[docDataset].push(source)
        return acc
    }, {})


    return <div>
        {Object.entries(groupedSources).map(([docDataset, hits]) => {
            const sourceTitle = resultRenderers[docDataset]?.sourceTitle || defaultResultRenderer.sourceTitle
            const sourceDetails = resultRenderers[docDataset]?.sourceDetails || defaultResultRenderer.sourceDetails

            return <div key={docDataset}>
                <h3>{datasetTitles[docDataset]}</h3>
                <ul className="flex flex-wrap gap-2 !list-none !p-0 !m-0">
                    {(hits as any[]).map((hit: any, index: number) => (
                        <li key={index} className="border border-neutral-200 rounded-lg !py-2 px-4 !m-0 max-w-96">
                          <Link className="no-underline w-full h-full" href={"/uuid/" + hit.fields.uuid[0]}>
                          {sourceTitle(hit)}
                          {sourceDetails(hit)}
                          </Link>
                        </li>
                    ))}
                </ul>
            </div>
        })}
    </div>
}