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


    const detailsRenderer = resultRenderers[docDataset]?.details || defaultResultRenderer.details
    const titleRenderer = resultRenderers[docDataset]?.title || defaultResultRenderer.title
    const sourceWindowRenderer = resultRenderers[docDataset]?.sourceWindow || defaultResultRenderer.sourceWindow

    // labels that are different from the main label
    const labels = hit.fields.altLabels?.filter((label: string) => 
        label !== hit.fields.label[0]
    ) || []

    // Fix: "attestations.label" is an array of strings, not objects
    hit.fields["attestations.label"]?.forEach((attestation: string) => {
        if (!labels.includes(attestation) && attestation !== hit.fields.label[0]) {
            labels.push(attestation)
        }
    })


    return  <li className="flex flex-grow !p-0 !m-0">
        <div className="w-full h-full flex items-center gap-2">
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
                <PiInfoFill className="text-primary-600 group-aria-[current='page']:text-accent-800 text-2xl" />
            </ClickableIcon>
            <div className="">
                <strong>{hit.fields.label}</strong>
                {hit.fields.sosi && ` (${hit.fields.sosi})`}
                {labels?.length > 0 &&
                    <span className="text-neutral-900">
                        {" - " +labels?.join(', ')}
                    </span>
                }
            </div>
        </div>
    </li>
}

