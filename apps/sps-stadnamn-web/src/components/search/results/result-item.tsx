'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useDataset } from '@/lib/search-params';
import { useRef, useEffect, useContext } from 'react';
import { PiBookOpen } from 'react-icons/pi';
import Clickable from '@/components/ui/clickable/clickable';
import { useSearchParams } from 'next/navigation';
import { GlobalContext } from '@/app/global-provider';
import { datasetTitles } from '@/config/metadata-config';
import { stringToBase64Url } from '@/lib/utils';



export default function ResultItem({hit}: {hit: any}) {
    const dataset = useDataset()
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const nav = searchParams.get('nav')
    const itemRef = useRef<HTMLAnchorElement>(null)
    const docDataset = hit._index.split('-')[2]
    const parent = searchParams.get('parent')
    const expanded = searchParams.get('expanded')
    const { isMobile } = useContext(GlobalContext)

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
        <Clickable link ref={itemRef} className="w-full h-full p-3 flex items-center hover:bg-neutral-50 no-underline aria-[current='page']:bg-accent-50 aria-[current='page']:border-l-4 border-accent-700" 
                    aria-current={(doc == hit.fields.uuid || hit.fields.children?.includes(doc)) ? 'page' : undefined}
                    remove={['sourceDataset', 'sourceLabel', 'docDataset', 'expanded']}
                    add={{
                        doc: hit.fields?.children?.length === 1 ? hit.fields.children[0] : hit.fields.uuid,
                        ...(hit.fields?.datasets?.length === 1 ? {docDataset: hit.fields.datasets[0]} : {}),
                        ...(parent && !isMobile) ? {parent: docDataset == 'search' ? hit.fields.uuid : hit.fields?.within} : {},
                        ...(hit.fields.gnidu) ? {expanded: stringToBase64Url(`gnidu-${hit.fields.gnidu[0]}-${encodeURIComponent(hit.fields.label[0])}`)} : {},

                        //...(hit.fields.location?.[0].type == 'Point' && !parent) ? {center: hit.fields.location[0].coordinates.toReversed()} : {}
                    }}>
            <div>
                <span className="text-neutral-950">{titleRenderer(hit, 'map')}</span>
                {dataset == 'search' && <div className="float-right flex flex-col gap-1 text-neutral-950 text-sm">  { hit.fields?.children?.length > 1 ? 
                <span className="self-center flex gap-1 items-center">
                    <span>{hit.fields.children.length} kjelder</span>
                    </span>
                    
                :<span className="self-center flex gap-1 items-center max-w-32 truncate">
                    
                    
                    {datasetTitles[hit.fields.datasets[0]]}
                    
                    </span>
                
                    
                 }
                </div>
                }
                {hit.highlight && snippetRenderer ? (
                    <> | {detailsRenderer(hit, 'map')} {snippetRenderer(hit)}  </>
                ) : (
                    <p>{detailsRenderer(hit, 'map')}</p>
                )}
            </div>
            {dataset == "all" && hit.inner_hits?.gnidu?.hits?.total?.value > 1 && (
                <div className="ml-auto flex items-center rounded-full bg-neutral-100 text-neutral-950 text-sm px-2.5 py-1">
                    {hit.inner_hits?.gnidu?.hits?.total?.value}
                </div>
            )}
            
            </Clickable>
            </li>
}

