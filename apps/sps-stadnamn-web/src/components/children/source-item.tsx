'use client'
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers';
import { PiBookOpenFill, PiBookOpenLight } from 'react-icons/pi';

export default function SourceItem({hit, isMobile, selectedDoc, goToDoc}: {hit: any, isMobile: boolean, selectedDoc: any, goToDoc: (doc: any) => void}) {
    const docDataset = hit._index.split('-')[2]   
    const sourceTitle = resultRenderers[docDataset]?.sourceTitle || defaultResultRenderer.sourceTitle
    const sourceDetails = resultRenderers[docDataset]?.sourceDetails || defaultResultRenderer.sourceDetails

    return  <div className="w-full h-full flex items-center gap-1 py-1">
            <button 
                type="button"
                aria-current={selectedDoc == hit._source.uuid ? 'page' : undefined}
                className="group no-underline flex gap-1 items-center rounded-full"
                onClick={() => goToDoc(hit._source.uuid)}

                
            >
                <div className="group-hover:bg-neutral-100 p-1 rounded-full group-aria-[current='page']:border-accent-800 border-2 border-transparent">
                    {selectedDoc == hit._source.uuid ? <PiBookOpenFill className="text-primary-700 text-xl group-aria-[current='page']:text-accent-800" /> : <PiBookOpenLight className="text-primary-700 text-xl group-aria-[current='page']:text-accent-800" />}
                </div>
                {sourceTitle(hit)}
            </button>

            {sourceDetails(hit)}
            
        </div>
}

