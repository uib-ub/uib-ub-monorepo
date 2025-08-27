'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { useMode, usePerspective, useSearchQuery } from '@/lib/search-params';
import { useRef, useEffect, useContext } from 'react';
import Clickable from '@/components/ui/clickable/clickable';
import { useSearchParams } from 'next/navigation';
import { GlobalContext } from '@/app/global-provider';
import { stringToBase64Url } from '@/lib/utils';

const uniqueLabels = (hit: any) => {
    const labels = new Set<string>();
    const hits = hit.inner_hits?.group?.hits?.hits || [];
    for (const innerHit of hits) {
        for (const label of innerHit.fields?.label || []) {
            if (labels.size < 3) labels.add(label);
            if (labels.size === 3) break;
        }
        if (labels.size === 3) break;
        for (const label of innerHit.fields?.altLabels || []) {
            if (labels.size < 3) labels.add(label);
            if (labels.size === 3) break;
        }
        if (labels.size === 3) break;
    }
    return Array.from(labels).map((label, idx) => (
        <span key={label + idx} className="mr-2">{label}</span>
    ));
}

export default function ResultItem({hit}: {hit: any}) {
    const perspective = usePerspective()
    const searchParams = useSearchParams()
    const doc = searchParams.get('doc')
    const nav = searchParams.get('nav')
    const itemRef = useRef<HTMLAnchorElement>(null)
    const docDataset = hit._index.split('-')[2]
    const { isMobile } = useContext(GlobalContext)
    const mode = useMode()
    const { highlightedGroup } = useContext(GlobalContext)
    const details = searchParams.get('details')
    const datasetTag = searchParams.get('datasetTag')
    const { searchFilterParamsString } = useSearchQuery()

    const titleRenderer = resultRenderers[docDataset]?.title || defaultResultRenderer.title
    const detailsRenderer = (hit: any) => {
        const adm1 = hit.fields["group.adm1"]
        const adm2 = hit.fields["group.adm2"]
        const adm3 = hit.fields["group.adm3"]
        return <>{adm2 ? adm2 + ', ' : ''}{adm1}</>
    }
    const snippetRenderer = resultRenderers[docDataset]?.snippet || defaultResultRenderer.snippet

    const isGrunnord = docDataset?.includes('_g')
    const group = searchParams.get('group')
    const isSelected = highlightedGroup ? highlightedGroup == stringToBase64Url(hit.fields?.['group.id']?.[0]) : group == stringToBase64Url(hit.fields?.['group.id']?.[0])


    useEffect(() => {
        // Scroll into view if section changes to results

        if (isMobile && nav == 'results' && doc == hit.fields.uuid && itemRef.current) {
            itemRef.current.scrollIntoView({behavior: 'instant', block: 'center'})
        }
    }, [nav, doc, hit.fields.uuid, isMobile])

    

    
    return  <Clickable link ref={itemRef} className={`w-full h-full p-3 aria-[current='page']:bg-accent-50 ${isGrunnord ? 
                        "border-neutral-200 bg-neutral-50 border rounded-md my-1 hover:bg-neutral-100 hover:shadow-sm aria-[current='page']:border-accent-200"
                        : "border-l-accent-700 border-b border-b-neutral-200  aria-[current='page']:border-l-4"} flex items-center group hover:bg-neutral-50 no-underline `} 
                    aria-current={isSelected ? 'page' : undefined}
                    remove={['group', 'parent', ...(isMobile ? ['nav', 'namesNav'] : [])]}
                    add={{
                        doc: hit.fields.uuid,
                        details: mode == 'list' ? 'group' : details || 'doc', 
                        ...(hit.fields["group.id"] ? {group: stringToBase64Url(hit.fields["group.id"][0])} : {}),

                        //...(hit.fields.location?.[0].type == 'Point' && !parent) ? {center: hit.fields.location[0].coordinates.toReversed()} : {}
                    }}>
                        
            <div className="flex flex-col w-full">             
             {isGrunnord && <>
  <div className="flex items-center mb-1">
    <span className="uppercase font-semibold text-lg text-neutral-700 group-aria-[current='page']:text-accent-800">
      Grunnord
    </span>
    {!searchFilterParamsString && isGrunnord && 
      <span className="bg-neutral-700 font-semibold text-white w-6 h-6 group-aria-[current='page']:bg-accent-800 rounded-full flex items-center justify-center ml-1.5">
        {hit.inner_hits.group.hits.hits[0].fields.label[0][0].toUpperCase()}
      </span>
    }
  </div>
</>}

                <span className="text-neutral-950 flex items-center">
                    
                    
                    {uniqueLabels(hit)}
                     {false && titleRenderer(hit, 'map')}{hit.inner_hits?.group?.hits?.total?.value > 3 && "..."}
                    
                </span>
                
                {detailsRenderer(hit)}
                {hit.highlight && snippetRenderer && <>{snippetRenderer(hit)}</>}
            </div>
            {perspective == "all" && hit.inner_hits?.group?.hits?.total?.value > 1 && (
                <div className={`ml-auto flex items-center rounded-full text-sm px-2.5 py-1 bg-neutral-100 text-neutral-950 group-aria-[current='page']:bg-accent-800 group-aria-[current='page']:text-white ${
                    isGrunnord ? "bg-neutral-200 text-black" : ""
                }`}>
                    {hit.inner_hits?.group?.hits?.total?.value}
                </div>
            )}

            
            </Clickable>
}

