'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useQueryState } from "nuqs";
import { useDataset } from '@/lib/search-params';
import { useRef, useEffect } from 'react';
import { PiArrowRight, PiDatabase, PiTag } from 'react-icons/pi';
import SearchLink from '@/components/ui/search-link';
import { treeSettings } from '@/config/server-config';

export default function TreeItem({hit, isMobile}: {hit: any, isMobile: boolean}) {
    const dataset = useDataset()
    const cadastralUnit = useQueryState('cadastralUnit')[0]
    const doc = useQueryState('doc')[0]
    const nav = useQueryState('nav')[0]
    const itemRef = useRef<HTMLAnchorElement>(null)
    const mode = useQueryState('mode', {defaultValue: 'map'})[0]

    const docDataset = hit._index.split('-')[2]
    const subunit = docDataset ? treeSettings[docDataset]?.subunit : undefined;

    useEffect(() => {
        // Scroll into view if section changes to results
        if (isMobile && nav == 'results' && (cadastralUnit == hit.fields.uuid || doc == hit.fields.uuid) && itemRef.current) {
            itemRef.current.scrollIntoView({behavior: 'instant', block: 'center'})
        }
    }, [nav, cadastralUnit, doc, hit.fields.uuid, isMobile])


    return  <li className="flex flex-grow">
            <SearchLink ref={itemRef} className="w-full h-full py-2 px-2 md:px-2 hover:bg-neutral-50 no-underline aria-[current='page']:bg-accent-200"
                    aria-current={(cadastralUnit == hit.fields.uuid || doc == hit.fields.uuid) ? 'page' : undefined}
                    remove={['doc', 'point', 'attestationYear', 'attestationLabel', 'center']}
                    add={{
                        cadastralUnit: hit.fields.uuid,
                        doc: hit.fields.uuid,
                    ...hit.fields.location?.[0].type == 'Point' ? {center: hit.fields.location[0].coordinates.toReversed()} : {}}}>

                    
            <span className="text-neutral-950">{ (subunit && hit.fields[subunit]) || hit.fields.cadastre[0].gnr.join(", ")} {hit.fields.label}</span>

            </SearchLink>
            </li>
}

