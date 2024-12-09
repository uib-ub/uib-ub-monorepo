'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useQueryState } from "nuqs";
import { useDataset } from '@/lib/search-params';
import { useRef, useEffect, useContext } from 'react';
import { PiArrowRight, PiDatabase, PiTag } from 'react-icons/pi';
import SearchLink from '@/components/ui/search-link';
import { treeSettings } from '@/config/server-config';
import { useSearchParams } from 'next/navigation';
import { DocContext } from '@/app/doc-provider';

export default function TreeItem({hit, isMobile}: {hit: any, isMobile: boolean}) {
    const within = useQueryState('within')[0]
    const doc = useQueryState('doc')[0]
    const nav = useQueryState('nav')[0]
    const itemRef = useRef<HTMLAnchorElement>(null)
    const searchParams = useSearchParams()
    const { docData } = useContext(DocContext)

    const docDataset = hit?._index.split('-')[2]
    const subunit = docDataset ? treeSettings[docDataset]?.subunit : undefined;

    useEffect(() => {
        // Scroll into view if section changes to results
        if (nav == 'results' && (within == hit.fields.uuid || doc == hit.fields.uuid) && itemRef.current) {
            itemRef.current.scrollIntoView({behavior: 'instant', block: 'center'})
        }
    }, [nav, within, doc, hit.fields.uuid, isMobile])


    return  <li className="flex flex-grow">        


            <SearchLink ref={itemRef} className="w-full h-full py-2 px-2 md:px-2 hover:bg-neutral-50 no-underline aria-[current='page']:bg-accent-100 aria-[current='page']:border-l-4 border-accent-700"
                    aria-current={(within == hit.fields.uuid || doc == hit.fields.uuid || docData?._source?.within == hit.fields.uuid) ? 'page' : undefined}
                    only={{
                        dataset: docDataset,
                        ...(searchParams.get('mode') == 'table' || searchParams.get('within')) ? {within: hit.fields.uuid, doc: hit.fields.uuid} : {doc: hit.fields.uuid},
                        nav: 'tree',
                        mode: searchParams.get('mode'),
                        adm: searchParams.get('adm'),
                        center: searchParams.get('center'),
                        zoom: searchParams.get('zoom'),

                    }}>

                    
            <span className="text-neutral-950">{ (subunit && hit.fields[subunit]) || hit.fields.cadastre?.[0]?.gnr.join(", ")} {hit.fields.label}</span>

            </SearchLink>
            </li>
}

