'use client'
import { useRef, useEffect, useContext } from 'react';
import ParamLink from '@/components/ui/param-link';
import { treeSettings } from '@/config/server-config';
import { useSearchParams } from 'next/navigation';
import { DocContext } from '@/app/doc-provider';

export default function TreeItem({hit, isMobile}: {hit: any, isMobile: boolean}) {
    const searchParams = useSearchParams()
    const parent = searchParams.get('parent')
    const doc = searchParams.get('doc')
    const nav = searchParams.get('nav')
    const itemRef = useRef<HTMLAnchorElement>(null)
    const mode = searchParams.get('mode') || 'map'
    
    const { docData } = useContext(DocContext)

    const docDataset = hit?._index.split('-')[2]
    const subunit = docDataset ? treeSettings[docDataset]?.subunit : undefined;

    useEffect(() => {
        // Scroll into view if section changes to results
        if (nav == 'results' && (parent == hit.fields.uuid || doc == hit.fields.uuid) && itemRef.current) {
            itemRef.current.scrollIntoView({behavior: 'instant', block: 'center'})
        }
    }, [nav, parent, doc, hit.fields.uuid, isMobile])


    return  <li className="flex flex-grow">        


            <ParamLink ref={itemRef} className="w-full h-full py-2 px-2 md:px-2 hover:bg-neutral-50 no-underline aria-[current='page']:bg-accent-100 aria-[current='page']:border-l-4 border-accent-800"
                    aria-current={(parent == hit.fields.uuid || doc == hit.fields.uuid || docData?._source?.within == hit.fields.uuid) ? 'page' : undefined}
                    only={{
                        dataset: docDataset,
                        ...(mode != 'map' || parent) ? {parent: hit.fields.uuid, doc: hit.fields.uuid} : {doc: hit.fields.uuid},
                        nav: 'tree',
                        mode: searchParams.get('mode'),
                        adm: searchParams.get('adm'),

                    }}>

                    
            <span className="text-neutral-950">{ (subunit && hit.fields[subunit]) || hit.fields.cadastre?.[0]?.gnr.join(", ")} {hit.fields.label}</span>

            </ParamLink>
            </li>
}

