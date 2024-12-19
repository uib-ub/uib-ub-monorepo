'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useDataset } from '@/lib/search-params';
import { useRef, useEffect } from 'react';
import { PiArrowRight, PiDatabase, PiTag } from 'react-icons/pi';
import ParamLink from '@/components/ui/param-link';
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


    const titleRenderer = resultRenderers[dataset]?.title || defaultResultRenderer.title
    const detailsRenderer = resultRenderers[dataset]?.details || defaultResultRenderer.details
    const snippetRenderer = resultRenderers[dataset]?.snippet || defaultResultRenderer.snippet

    

    return  <li className="flex flex-grow !p-0 !m-0">
        <ParamLink ref={itemRef} className="w-full h-full py-2 px-2 md:px-2 hover:bg-neutral-50 no-underline aria-[current='page']:bg-accent-100 aria-[current='page']:border-l-4 border-accent-800" 
                    aria-current={(doc == hit.fields.uuid || hit.fields.children?.includes(doc)) ? 'page' : undefined}
                    add={{
                        doc: hit.fields?.children?.length === 1 ? hit.fields.children[0] : hit.fields.uuid,
                        parent: parent && docDataset == 'search' ? hit.fields.uuid : null,
                        attestationYear: null,
                        attestationLabel: null,
                        ...hit.fields.location?.[0].type == 'Point' ? {center: hit.fields.location[0].coordinates.toReversed(), zoom} : {}
                    }}>

            <span className="text-neutral-950">{titleRenderer(hit, 'map')}</span>
            
            

            </ParamLink>
            </li>
}

