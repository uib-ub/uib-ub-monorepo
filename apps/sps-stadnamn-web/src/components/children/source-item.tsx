'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useDataset } from '@/lib/search-params';
import { useRef, useEffect } from 'react';
import { PiArrowRight, PiDatabase, PiInfoFill, PiTag } from 'react-icons/pi';
import Clickable from '@/components/ui/clickable/clickable';
import { useSearchParams } from 'next/navigation';
import ClickableIcon from '@/components/ui/clickable/clickable-icon';



export default function SourceItem({hit, isMobile}: {hit: any, isMobile: boolean}) {
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const itemRef = useRef<HTMLAnchorElement>(null)
    const docDataset = hit._index.split('-')[2]
    const parent = searchParams.get('parent')


    const sourceTitle = resultRenderers[docDataset]?.sourceTitle || defaultResultRenderer.sourceTitle
    const sourceDetails = resultRenderers[docDataset]?.sourceDetails || defaultResultRenderer.sourceDetails



    return  <div className="w-full h-full flex items-center gap-2 py-1">
            <ClickableIcon 
                link
                label="Vis kjelde"
                aria-current={(doc == hit.fields.uuid[0]) ? 'page' : undefined}
                ref={itemRef}
                className="group p-1 hover:bg-neutral-100 rounded-full border-2 border-transparent aria-[current='page']:border-accent-800"
                add={{
                    doc: hit.fields?.children?.length === 1 ? hit.fields.children[0] : hit.fields.uuid[0],
                    parent: parent && docDataset == 'search' ? hit.fields.uuid[0] : null,
                }}
            >
                <PiInfoFill className="text-primary-600 group-aria-[current='page']:text-accent-800 text-xl" />
            </ClickableIcon>
            <div className="flex flex-col">
                <div className="">
                    {sourceTitle(hit)}
                </div>
                {sourceDetails(hit)}
            </div>
        </div>
}

