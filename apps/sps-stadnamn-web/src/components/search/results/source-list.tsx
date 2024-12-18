
'use client'
import { useState, useEffect, useContext } from 'react'
import ErrorMessage from '@/components/error-message'
import { DocContext } from '@/app/doc-provider'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChildrenContext } from '@/app/children-provider' 
import { datasetTitles } from '@/config/metadata-config'
import SourceItem from './source-item'
import IconButton from '@/components/ui/icon-button'
import { useQueryState } from 'nuqs'
import { PiInfo, PiInfoFill, PiTag, PiTagFill, PiX } from 'react-icons/pi'
import ParamLink from '@/components/ui/param-link'

export default function SourceList() {
    const { childrenData, childrenLoading, childrenError } = useContext(ChildrenContext)
    const [error, setError] = useState<any>(null)
    const { parentData } = useContext(DocContext)
    const pathname = usePathname()
    const landingPage = pathname.startsWith('/uuid')
    const setParent = useQueryState('parent')[1]
    const searchParams = useSearchParams()
    const mode = searchParams.get('mode')
    const doc = searchParams.get('doc')



    

    if (error) {
      return <ErrorMessage error={error} message="Kunne ikke hente dokumentene"/>
    }


    return childrenData && parentData?._source?.uuid && Object.keys(childrenData).length > 0 ?
        <div className="mb-8 instance-info"> 
        <div className= {`flex items-center gap-2 px-2`}>
        <h2 className="">
        Kilder — {parentData._source.label}  
            </h2>
        {mode != 'table' && 
                

                <IconButton className="ml-auto selv-top text-2xl" label="Lukk" onClick={() => setParent(null)}><PiX aria-hidden="true"/></IconButton>
                
                }
          </div>
          <ParamLink className="flex gap-2 font-semibold w-full h-full py-2 px-2 md:px-2 hover:bg-neutral-50 no-underline aria-[current='page']:bg-accent-100 aria-[current='page']:border-l-4 border-accent-800" 
                      add={{doc: parentData._source.uuid}}
                      aria-current={doc == parentData._source.uuid ? 'page' : undefined}>
                 <PiTagFill className={`text-sm text-${doc == parentData._source.uuid ? 'accent-800' : 'primary-600'} self-center`}/> {parentData._source.label}
            </ParamLink>

    {Object.entries<Record<string, any>[]>(childrenData.reduce((acc: Record<string, Record<string, any>[]>, doc: Record<string, any>) => {
         // Group by dataset
        const index = doc._index.split('-')[2]
        if (!acc[index]) acc[index] = []
        acc[index].push(doc)
        return acc
       
    }, {})).map(([docDataset, docs]) => (
        <div key={docDataset}>
            <h3 className="!text-xl border-b border-neutral-200 px-2 !pb-1">{datasetTitles[docDataset]}</h3>
            <ul className="!p-0 divide-y divide-neutral-200">
              {docs.map((doc: Record<string, any>) => (
                <SourceItem key={doc._id} hit={doc} isMobile={false}/>
              ))}
            </ul>
        </div>
    ))}
    </div>
        : null
}
