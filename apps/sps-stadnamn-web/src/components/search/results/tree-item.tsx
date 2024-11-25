'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers-map-search';
import { useQueryState } from "nuqs";
import { useDataset } from '@/lib/search-params';
import { useRef, useEffect } from 'react';
import { PiArrowRight, PiDatabase, PiTag } from 'react-icons/pi';
import SearchParamsLink from '@/components/ui/search-params-link';

export default function TreeItem({hit, isMobile}: {hit: any, isMobile: boolean}) {
    const dataset = useDataset()
    const cadastralUnit = useQueryState('cadastralUnit')[0]
    const expanded = useQueryState('expanded')[0]
    const itemRef = useRef<HTMLAnchorElement>(null)
    const titleRenderer = resultRenderers[dataset]?.title || defaultResultRenderer.title

    useEffect(() => {
        // Scroll into view if expanded changes to results
        if (isMobile && expanded == 'results' && cadastralUnit == hit.fields.uuid && itemRef.current) {
            itemRef.current.scrollIntoView({behavior: 'instant', block: 'center'})
        }
    }, [expanded, cadastralUnit, hit.fields.uuid, isMobile])


    return  <li className="flex flex-grow">
            <SearchParamsLink ref={itemRef} className="w-full h-full py-2 px-2 md:px-4 hover:bg-neutral-50 no-underline aria-[current='page']:bg-accent-100"
                    aria-current={cadastralUnit == hit.fields.uuid ? 'page' : undefined}
                    withoutParams={['doc', 'point', 'attestationYear', 'attestationLabel', 'center']}
                    addParams={{
                        expanded: 'cadastre',
                        cadastralUnit: hit.fields.uuid,
                        doc: hit.fields.uuid,
                    ...hit.fields.location?.[0].type == 'Point' ? {center: hit.fields.location[0].coordinates.toReversed()} : {}}}>

                    
            <span className="text-neutral-950">{titleRenderer(hit, 'map')}</span>

            </SearchParamsLink>
            </li>
}

