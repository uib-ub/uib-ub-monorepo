import { datasetTitles } from '@/config/metadata-config'
import { resultRenderers } from '@/config/result-renderers'
import { defaultResultRenderer } from '@/config/result-renderers'
import { getFieldValue } from '@/lib/utils'
import Link from 'next/link'
import { PiBookOpen } from 'react-icons/pi'

export default async function ServerSourcesList({ childrenData }: { childrenData: Record<string, any>[] }) {

    const groupedSources = childrenData.reduce((acc: Record<string, any[]>, source: any) => {
        const docDataset = source._index?.split("-")[2]
        if (!acc[docDataset]) {
            acc[docDataset] = []
        }
        acc[docDataset].push(source)
        return acc
    }, {})


    return <div className="flex flex-col gap-2">
        {Object.entries(groupedSources).map(([docDataset, hits]) => {
            const sourceTitle = resultRenderers[docDataset]?.sourceTitle || defaultResultRenderer.sourceTitle
            const sourceDetails = resultRenderers[docDataset]?.sourceDetails || defaultResultRenderer.sourceDetails

            return <div key={docDataset} className="mt-2">
                <h3 className="!m-0 !p-0 font-serif !text-lg !font-normal">{datasetTitles[docDataset]}</h3>
                <ul className="!p-0 divide-y divide-neutral-200 gap-2">
                    {(hits as any[]).map((hit: any, index: number) => (
                        <li key={index} className="flex flex-grow !p-0 !m-0">
                            <Link className="w-full h-full flex items-center gap-2 py-1 no-underline group" href={"/uuid/" + getFieldValue(hit, 'uuid')}>
                                <div className="group-hover:bg-neutral-100 p-1 rounded-full">
                                    <PiBookOpen className="text-primary-600" />
                                </div>
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