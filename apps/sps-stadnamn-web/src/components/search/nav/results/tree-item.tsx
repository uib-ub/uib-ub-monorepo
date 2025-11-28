'use client'
import Clickable from '@/components/ui/clickable/clickable';
import { treeSettings } from '@/config/server-config';
import { useMode } from '@/lib/param-hooks';
import useDocData from '@/state/hooks/doc-data';
import { GlobalContext } from '@/state/providers/global-provider';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useRef } from 'react';
export default function TreeItem({ hit }: { hit: any }) {
    const searchParams = useSearchParams()
    const { isMobile } = useContext(GlobalContext)
    const parent = searchParams.get('parent')
    const doc = searchParams.get('doc')
    const nav = searchParams.get('nav')
    const itemRef = useRef<HTMLAnchorElement>(null)
    const mode = useMode()

    const { docData } = useDocData()

    const docDataset = hit?._index.split('-')[2]
    const subunit = docDataset ? treeSettings[docDataset]?.subunit : undefined;

    useEffect(() => {
        // Scroll into view if section changes to results
        if (nav == 'results' && (parent == hit.fields.uuid || doc == hit.fields.uuid) && itemRef.current) {
            itemRef.current.scrollIntoView({ behavior: 'instant', block: 'center' })
        }
    }, [nav, parent, doc, hit.fields.uuid, isMobile])


    return <li className="flex flex-grow">


        <Clickable link ref={itemRef} className="w-full h-full py-2 px-2 md:px-2 hover:bg-neutral-50 no-underline aria-[current='page']:bg-accent-100 aria-[current='page']:border-l-4 border-accent-700"
            aria-current={(parent == hit.fields.uuid || doc == hit.fields.uuid || docData?._source?.within == hit.fields.uuid) ? 'page' : undefined}
            only={{
                dataset: docDataset,
                ...(mode != 'map' || parent) ? { parent: hit.fields.uuid, doc: hit.fields.uuid } : { doc: hit.fields.uuid },
                ...mode != 'map' ? { mode: 'doc' } : { mode: searchParams.get('mode') },
                datasetTag: 'tree',
                adm: searchParams.get('adm'),
                zoom: searchParams.get('zoom'),
                center: searchParams.get('center'),

            }}>


            <span className="text-neutral-950">{(subunit && hit.fields[subunit]) || hit.fields.cadastre?.[0]?.gnr.join(", ")} {hit.fields.label}</span>

        </Clickable>
    </li>
}

