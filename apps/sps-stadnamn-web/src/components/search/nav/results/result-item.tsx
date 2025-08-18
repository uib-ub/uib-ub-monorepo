'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useMode, usePerspective } from '@/lib/search-params';
import { useRef, useEffect, useContext } from 'react';
import Clickable from '@/components/ui/clickable/clickable';
import { useSearchParams } from 'next/navigation';
import { GlobalContext } from '@/app/global-provider';
import { stringToBase64Url } from '@/lib/utils';
import { GroupContext } from '@/app/group-provider';



export default function ResultItem({hit}: {hit: any}) {
    const perspective = usePerspective()
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const nav = searchParams.get('nav')
    const itemRef = useRef<HTMLAnchorElement>(null)
    const docDataset = hit._index.split('-')[2]
    const { isMobile } = useContext(GlobalContext)
    const mode = useMode()
    const { highlightedGroup } = useContext(GroupContext)
    const details = searchParams.get('details')
    const datasetTag = searchParams.get('datasetTag')

    const titleRenderer = resultRenderers[docDataset]?.title || defaultResultRenderer.title
    const detailsRenderer = (hit: any) => {
        const adm1 = hit.fields["group.adm1"]
        const adm2 = hit.fields["group.adm2"]
        const adm3 = hit.fields["group.adm3"]
        return <>{adm2 ? adm2 + ', ' : ''}{adm1}</>
    }
    const snippetRenderer = resultRenderers[docDataset]?.snippet || defaultResultRenderer.snippet

    const highlightAsGrunnord = docDataset?.includes('_g') && datasetTag != 'base'
    const isSelected = highlightedGroup && highlightedGroup == stringToBase64Url(hit.fields?.['group.id']?.[0])


    useEffect(() => {
        // Scroll into view if section changes to results

        if (isMobile && nav == 'results' && doc == hit.fields.uuid && itemRef.current) {
            itemRef.current.scrollIntoView({behavior: 'instant', block: 'center'})
        }
    }, [nav, doc, hit.fields.uuid, isMobile])

    

    
    return  <li className="flex flex-grow">
        <Clickable link ref={itemRef} className={`w-full h-full p-3 flex items-center group hover:bg-neutral-50 no-underline border-accent-700 aria-[current='page']:bg-accent-50 aria-[current='page']:border-l-4`} 
                    aria-current={isSelected ? 'page' : undefined}
                    remove={['group', 'parent', ...(isMobile ? ['nav', 'fuzzyNav'] : [])]}
                    add={{
                        doc: hit.fields.uuid,
                        details: mode == 'list' ? 'group' : details || 'doc', 
                        ...(hit.fields["group.id"] ? {group: stringToBase64Url(hit.fields["group.id"][0])} : {}),

                        //...(hit.fields.location?.[0].type == 'Point' && !parent) ? {center: hit.fields.location[0].coordinates.toReversed()} : {}
                    }}>
                        
            <div className="flex flex-col w-full">
            {highlightAsGrunnord && <strong className="uppercase font-semibold text-neutral-800 text-sm">Grunnord</strong>}

                <span className="text-neutral-950 flex items-center">
                     {titleRenderer(hit, 'map')} {highlightAsGrunnord && hit.inner_hits?.group?.hits?.total?.value > 1 && "..."}
                    
                </span>
                
                {detailsRenderer(hit)}
                {hit.highlight && snippetRenderer && <>{snippetRenderer(hit)}</>}
            </div>
            {perspective == "all" && hit.inner_hits?.group?.hits?.total?.value > 1 && (
                <div className={`ml-auto flex items-center rounded-full text-sm px-2.5 py-1 ${
                    isSelected ? 'bg-accent-800 text-white' : 'bg-neutral-100 text-neutral-950'
                }`}>
                    {hit.inner_hits?.group?.hits?.total?.value}
                </div>
            )}

            
            </Clickable>
        
            
            </li>
}

