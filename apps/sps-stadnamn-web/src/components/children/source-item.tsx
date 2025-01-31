'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useDataset } from '@/lib/search-params';
import { useRef, useEffect } from 'react';
import { PiArrowRight, PiDatabase, PiInfoFill, PiTag } from 'react-icons/pi';
import Clickable from '@/components/ui/clickable/clickable';
import { useSearchParams } from 'next/navigation';
import ClickableIcon from '@/components/ui/clickable/clickable-icon';



export default function SourceItem({hit, isMobile}: {hit: any, isMobile: boolean}) {
    const dataset = useDataset()
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const nav = searchParams.get('nav')
    const itemRef = useRef<HTMLAnchorElement>(null)
    const docDataset = hit._index.split('-')[2]
    const parent = searchParams.get('parent')
    const zoom = searchParams.get('zoom')


    const detailsRenderer = resultRenderers[docDataset]?.details || defaultResultRenderer.details
    const titleRenderer = resultRenderers[docDataset]?.title || defaultResultRenderer.title
    const sourceWindowRenderer = resultRenderers[docDataset]?.sourceWindow || defaultResultRenderer.sourceWindow

    // labels that either have a year or are different from the main label
    const attestationsLabels = hit._source.attestations?.map((att: {label: string}) => att.label) || []
    const allLabels: {label: string, year?: number}[] = hit._source.altLabels?.filter((label: string) => 
        label !== hit._source.label && !attestationsLabels.includes(label)
    )?.map((label: string) => ({label})) || []
    hit._source.attestations?.forEach((att: {label: string, year: number}) => {
        if (att?.year) {
            allLabels.push({label: att.label, year: att?.year})
        }
    })
    
    

    return  <li className="flex flex-grow !p-0 !m-0">
        <div className="w-full h-full py-2 flex items-center gap-2">
        <ClickableIcon 
                link
                label="Opne"
                aria-current={(doc == hit._source.uuid) ? 'page' : undefined}
                ref={itemRef}
                className="group p-1 hover:bg-neutral-100 rounded-full border-2 border-transparent aria-[current='page']:border-accent-800"
                add={{
                    doc: hit._source?.children?.length === 1 ? hit._source.children[0] : hit._source.uuid,
                    parent: parent && docDataset == 'search' ? hit._source.uuid : null,
                }}
            >
                <PiInfoFill className="text-primary-600 group-aria-[current='page']:text-accent-800 text-2xl" />
            </ClickableIcon>
            <div className="">
                <strong>{hit._source.label}</strong>{hit._source.sosi && ` (${hit._source.sosi})`}
                <div className="flex gap-1">
                {allLabels?.map((item: {label: string, year?: number}, index: number) => (
                    <span key={index} className="text-neutral-800">
                        {item?.year ? (
                            <span className="whitespace-nowrap">
                                <span className="font-medium">{item.year}</span>: {item.label}
                            </span>
                        ) : (
                            item.label
                        )}
                    </span>
                ))}
                </div>
            </div>

            
        </div>
            </li>
}

