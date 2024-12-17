'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useDataset } from '@/lib/search-params';
import { useRef, useEffect } from 'react';
import { PiArrowRight, PiDatabase, PiTag } from 'react-icons/pi';
import SearchLink from '@/components/ui/search-link';
import { useSearchParams } from 'next/navigation';



export default function ResultItem({hit, isMobile}: {hit: any, isMobile: boolean}) {
    const dataset = useDataset()
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const nav = searchParams.get('nav')
    const itemRef = useRef<HTMLAnchorElement>(null)
    const docDataset = hit._index.split('-')[2]
    const parent = searchParams.get('parent')


    const titleRenderer = resultRenderers[dataset]?.title || defaultResultRenderer.title
    const detailsRenderer = resultRenderers[dataset]?.details || defaultResultRenderer.details
    const snippetRenderer = resultRenderers[dataset]?.snippet || defaultResultRenderer.snippet

    useEffect(() => {
        // Scroll into view if section changes to results
        if (isMobile && nav == 'results' && doc == hit.fields.uuid && itemRef.current) {
            itemRef.current.scrollIntoView({behavior: 'instant', block: 'center'})
        }
    }, [nav, doc, hit.fields.uuid, isMobile])

    

    return  <li className="flex flex-grow">
        <SearchLink ref={itemRef} className="w-full h-full py-2 px-2 md:px-2 hover:bg-neutral-50 no-underline aria-[current='page']:bg-accent-100 aria-[current='page']:border-l-4 border-accent-700" 
                    aria-current={(doc == hit.fields.uuid || hit.fields.children?.includes(doc)) ? 'page' : undefined}
                    add={{
                        doc: hit.fields?.children?.length === 1 ? hit.fields.children[0] : hit.fields.uuid,
                        parent: parent && docDataset == 'search' ? hit.fields.uuid : null,
                        attestationYear: null,
                        attestationLabel: null,
                        ...hit.fields.location?.[0].type == 'Point' ? {center: hit.fields.location[0].coordinates.toReversed()} : {}
                    }}>

            <span className="text-neutral-950 flex items-center">{titleRenderer(hit, 'map')}</span>
            {dataset == 'search' && <div className="float-right flex flex-col gap-1 text-neutral-950 text-sm">  { hit.fields?.children?.length > 1 ? 
            <span className="self-center flex gap-1 items-center">
                <PiDatabase aria-hidden="true"/>
                <span>{hit.fields.children.length} kilder</span>
                </span>
                
            :<span className="self-center flex gap-1 items-center">
                
                
                <PiArrowRight aria-hidden="true"/><PiDatabase aria-hidden="true"/><span className="sr-only">Omdirigert til kilde</span>
                
                </span>
            
                
             }
            </div>
            }
            
            {hit.highlight && snippetRenderer ? <> | {detailsRenderer(hit, 'map')} {snippetRenderer(hit)}  </>
            : <p>
            { detailsRenderer(hit, 'map') }
            </p>}
            

            </SearchLink>
            </li>
}

