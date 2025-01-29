'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useDataset } from '@/lib/search-params';
import { useRef, useEffect } from 'react';
import { PiArrowRight, PiDatabase, PiTag } from 'react-icons/pi';
import Clickable from '@/components/ui/clickable/clickable';
import { useSearchParams } from 'next/navigation';



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
    const attestationsLabels = hit.fields.attestations?.map((att: {label: string}) => att.label) || []
    const allLabels = hit.fields.altLabels?.filter((label: string) => label !== hit.fields.label && !attestationsLabels.includes(label))?.map((label: string) => {label}) || []
    hit.fields.attestations?.forEach((att: {label: string, year: number}) => {
        if (att?.year) {
            allLabels.push({label: att.label, year: att?.year})
        }
    })
    
    

    return  <li className="flex flex-grow !p-0 !m-0">
        <Clickable link ref={itemRef} className="w-full h-full py-2 px-2 md:px-2 hover:bg-neutral-50 no-underline aria-[current='page']:bg-accent-100 aria-[current='page']:border-l-4 border-accent-800" 
                    aria-current={(doc == hit.fields.uuid || hit.fields.children?.includes(doc)) ? 'page' : undefined}
                    add={{
                        doc: hit.fields?.children?.length === 1 ? hit.fields.children[0] : hit.fields.uuid,
                        parent: parent && docDataset == 'search' ? hit.fields.uuid : null,
                    }}>

            <span className="text-neutral-950">
                {titleRenderer(hit, 'map')}</span> 
                {allLabels?.map((item: {label: string, year?: number}, index: number) => <span key={index}>{item?.label}{item?.year ? ` (${item?.year})` : ''}</span>)}
       
            

            </Clickable>
            </li>
}

