'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useRef } from 'react';
import { PiBookOpen } from 'react-icons/pi';
import Clickable from '@/components/ui/clickable/clickable';
import { useSearchParams } from 'next/navigation';
import { getFieldValue } from '@/lib/utils';



export default function SourceItem({hit, isMobile}: {hit: any, isMobile: boolean}) {
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const itemRef = useRef<HTMLAnchorElement>(null)
    const docDataset = hit._index.split('-')[2]
    const parent = searchParams.get('parent')



    const sourceTitle = resultRenderers[docDataset]?.sourceTitle || defaultResultRenderer.sourceTitle
    const sourceDetails = resultRenderers[docDataset]?.sourceDetails || defaultResultRenderer.sourceDetails



    return  <div className="w-full h-full flex items-center gap-2 py-1">
            <Clickable 
                link
                aria-current={(doc == getFieldValue(hit, 'uuid')) ? 'page' : undefined}
                ref={itemRef}
                className="group no-underline flex gap-1 items-center rounded-full"
                remove={['docDataset', 'details']}
                add={{
                    doc: getFieldValue(hit, 'children')?.length === 1 ? getFieldValue(hit, 'children')[0] : getFieldValue(hit, 'uuid'),
                    details: 'doc',
                    //parent: parent ? getFieldValue(hit, 'uuid') : null,
                }}
            >
                <div className="group-hover:bg-neutral-100 p-1 rounded-full group-aria-[current='page']:border-accent-800 border-2 border-transparent">
                    <PiBookOpen className="text-primary-600 group-aria-[current='page']:text-accent-800" />
                </div>
                {sourceTitle(hit)}
            </Clickable>

            {sourceDetails(hit)}
            
        </div>
}

