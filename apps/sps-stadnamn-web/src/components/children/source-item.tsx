'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useDataset } from '@/lib/search-params';
import { useRef, useEffect } from 'react';
import { PiArrowRight, PiBookOpen, PiBookOpenBold, PiBookOpenTextBold, PiDatabase, PiInfoFill, PiTag } from 'react-icons/pi';
import Clickable from '@/components/ui/clickable/clickable';
import { useSearchParams } from 'next/navigation';
import ClickableIcon from '@/components/ui/clickable/clickable-icon';
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
                label="Vis kjelde"
                aria-current={(doc == getFieldValue(hit, 'uuid')) ? 'page' : undefined}
                ref={itemRef}
                className="group no-underline flex gap-1 items-center rounded-full"
                add={{
                    doc: isMobile ? null : getFieldValue(hit, 'children')?.length === 1 ? getFieldValue(hit, 'children')[0] : getFieldValue(hit, 'uuid'),
                    parent: parent && docDataset == 'search' ? getFieldValue(hit, 'uuid') : null,
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

