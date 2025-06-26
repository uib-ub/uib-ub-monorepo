'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useDataset } from '@/lib/search-params';
import { useRef, useEffect, useContext } from 'react';
import { PiBookOpen, PiWall, PiWallFill } from 'react-icons/pi';
import Clickable from '@/components/ui/clickable/clickable';
import { useSearchParams } from 'next/navigation';
import { GlobalContext } from '@/app/global-provider';
import { datasetTitles } from '@/config/metadata-config';
import { base64UrlToString, stringToBase64Url } from '@/lib/utils';
import RootWords from './root-words';



export default function ResultItem({hit}: {hit: any}) {
    const dataset = useDataset()
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const nav = searchParams.get('nav')
    const group = searchParams.get('group')
    const itemRef = useRef<HTMLAnchorElement>(null)
    const docDataset = hit._index.split('-')[2]
    const parent = searchParams.get('parent')
    const { isMobile } = useContext(GlobalContext)
    const details = searchParams.get('details') || 'doc'

    const titleRenderer = resultRenderers[dataset]?.title || defaultResultRenderer.title
    const detailsRenderer = resultRenderers[dataset]?.details || defaultResultRenderer.details
    const snippetRenderer = resultRenderers[dataset]?.snippet || defaultResultRenderer.snippet

    const isGrunnord = docDataset?.includes('_g')
    const isSelected = (doc == hit.fields.uuid || (hit.fields?.group && group == stringToBase64Url(hit.fields?.group?.[0])))


    useEffect(() => {
        // Scroll into view if section changes to results

        if (isMobile && nav == 'results' && doc == hit.fields.uuid && itemRef.current) {
            itemRef.current.scrollIntoView({behavior: 'instant', block: 'center'})
        }
    }, [nav, doc, hit.fields.uuid, isMobile])

    

    return  <li className="flex flex-grow">
        { isGrunnord ?
        <RootWords hit={hit}/>

        :
        <Clickable link ref={itemRef} className={`w-full h-full p-3 flex items-center group hover:bg-neutral-50 no-underline  ${isGrunnord ? "my-2 rounded-md border border-neutral-200 aria-[current='page']:bg-accent-50 aria-[current='page']:border-accent-700" : "border-accent-700 aria-[current='page']:bg-accent-50 aria-[current='page']:border-l-4 "}`} 
                    aria-current={isSelected ? 'page' : undefined}
                    remove={['sourceDataset', 'sourceLabel', 'docDataset', 'group']}
                    add={{
                        doc: hit.fields.uuid,
                        ...(hit.fields?.datasets?.length === 1 ? {docDataset: hit.fields.datasets[0]} : {}),
                        ...(parent && !isMobile) ? {parent: docDataset == 'search' ? hit.fields.uuid : hit.fields?.within} : {},
                        ...(hit.fields.group && (details != 'doc' || hit.inner_hits?.group?.hits?.total?.value > 1)) ? {group: stringToBase64Url(hit.fields.group[0])} : {},

                        //...(hit.fields.location?.[0].type == 'Point' && !parent) ? {center: hit.fields.location[0].coordinates.toReversed()} : {}
                    }}>
                        
            <div className="flex flex-col w-full">

                <span className="text-neutral-950 flex items-center">
                    {titleRenderer(hit, 'map')}
                    
                </span>

                {hit.highlight && snippetRenderer ? (
                    <> | {detailsRenderer(hit, 'map')} {snippetRenderer(hit)}  </>
                ) : (
                    <p>{detailsRenderer(hit, 'map')}</p>
                )}
            </div>
            {dataset == "all" && hit.inner_hits?.group?.hits?.total?.value > 1 && (
                <div className={`ml-auto flex items-center rounded-full text-sm px-2.5 py-1 ${
                    isSelected ? 'bg-accent-800 text-white' : 'bg-neutral-100 text-neutral-950'
                }`}>
                    {hit.inner_hits?.group?.hits?.total?.value}
                </div>
            )}

            
            </Clickable>
            }
            </li>
}

