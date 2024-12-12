'use client'
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsString, useQueryState } from "nuqs";
import { useDataset } from '@/lib/search-params';
import { useRef, useEffect } from 'react';
import { PiArrowRight, PiArticle, PiDatabase, PiMapPin, PiTag, PiTagFill } from 'react-icons/pi';
import { datasetTitles } from '@/config/metadata-config';



export default function ResultItem({hit, isMobile}: {hit: any, isMobile: boolean}) {
    const searchParams = useSearchParams()
    const dataset = useDataset()
    const doc = useQueryState('doc')[0]
    const nav = useQueryState('nav')[0]
    const itemRef = useRef<HTMLAnchorElement>(null)
    const serialize = createSerializer({
        doc: parseAsString,
        center: parseAsArrayOf(parseAsFloat, ','),
        point: parseAsArrayOf(parseAsFloat, ','),
        within: parseAsString,
        attestationYear: parseAsString,
        attestationLabel: parseAsString,
        nav: parseAsString,
    });

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
            <Link ref={itemRef} className="w-full h-full py-2 px-2 md:px-2 hover:bg-neutral-50 no-underline aria-[current='page']:bg-accent-100 aria-[current='page']:border-l-4 border-accent-700" 
                  aria-current={(doc == hit.fields.uuid || hit.fields.children?.includes(doc)) ? 'page' : undefined}
                  href={serialize(new URLSearchParams(searchParams), { doc: 
                    hit.fields?.children?.length === 1 ? hit.fields.children[0] : hit.fields.uuid, 
                    point: null, 
                    within: null,
                    attestationYear: null, attestationLabel: null, ...hit.fields.location?.[0].type == 'Point' ? {center: hit.fields.location[0].coordinates.toReversed()} : {}})}>
            <span className="text-neutral-950">{titleRenderer(hit, 'map')}</span>
            {dataset == 'search' && <div className="float-right flex flex-col gap-1 text-neutral-950 text-sm">  { hit.fields?.children?.length > 1 ? 
            <span className="self-center flex gap-1 items-center">
                <PiTag aria-hidden="true"/>
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
            

            </Link>
            </li>
}

