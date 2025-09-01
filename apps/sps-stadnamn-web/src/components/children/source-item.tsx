'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useRef } from 'react';
import { PiBookOpenFill, PiBookOpenLight, PiMapPinDuotone, PiMapPinFill } from 'react-icons/pi';
import Clickable from '@/components/ui/clickable/clickable';
import { useSearchParams } from 'next/navigation';
import { getFieldValue } from '@/lib/utils';
import ClickableIcon from '../ui/clickable/clickable-icon';
import { useGroup, useMode } from '@/lib/param-hooks';
import useGroupData from '@/state/hooks/group-data';



export default function SourceItem({hit, isMobile}: {hit: any, isMobile: boolean}) {
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const itemRef = useRef<HTMLAnchorElement>(null)
    const docDataset = hit._index.split('-')[2]
    const details = searchParams.get('details')
    const mode = useMode()
    const { groupData } = useGroupData()
    const { groupCode, groupValue } = useGroup()



    const sourceTitle = resultRenderers[docDataset]?.sourceTitle || defaultResultRenderer.sourceTitle
    const sourceDetails = resultRenderers[docDataset]?.sourceDetails || defaultResultRenderer.sourceDetails



    return  <div className="w-full h-full flex items-center gap-1 py-1">
            {hit?.fields?.location && <ClickableIcon
                label="Vis på kart"
                aria-current={(doc == getFieldValue(hit, 'uuid')) ? 'page' : undefined}
                className="text-neutral-700 aria-[current='page']:text-accent-800 p-1 hover:bg-neutral-100 rounded-full"
                add={{doc: hit.fields.uuid[0]}}
            >
                {doc == getFieldValue(hit, 'uuid') ? <PiMapPinFill className="text-xl" aria-hidden="true"/> : <PiMapPinDuotone className="text-xl" aria-hidden="true"/>}
            </ClickableIcon>}
            <Clickable 
                link
                aria-current={doc == getFieldValue(hit, 'uuid') ? 'page' : undefined}
                ref={itemRef}
                className="group no-underline flex gap-1 items-center rounded-full"
                add={{
                    doc: getFieldValue(hit, 'uuid'),
                    details: mode == 'map' ? 'doc' : details
                }}
                
            >
                <div className="group-hover:bg-neutral-100 p-1 rounded-full group-aria-[current='page']:border-accent-800 border-2 border-transparent">
                    {doc == getFieldValue(hit, 'uuid') ? <PiBookOpenFill className="text-primary-600 text-xl group-aria-[current='page']:text-accent-800" /> : <PiBookOpenLight className="text-primary-600 text-xl group-aria-[current='page']:text-accent-800" />}
                </div>
                {sourceTitle(hit)}
            </Clickable>

            {sourceDetails(hit)}
            {groupData?.[0]?._source?.group.id != getFieldValue(hit, 'group.id') && <em className="ml-auto px-4">Liknande oppslag</em>}
            
        </div>
}

