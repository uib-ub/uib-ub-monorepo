
'use client'
import { useState, useContext } from 'react'
import ErrorMessage from '@/components/error-message'
import { DocContext } from '@/app/doc-provider'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChildrenContext } from '@/app/children-provider' 
import { datasetTitles } from '@/config/metadata-config'
import SourceItem from './source-item'
import { useQueryState } from 'nuqs'

export default function SourceList() {
    const { childrenData, childrenLoading, childrenError } = useContext(ChildrenContext)
    const [error, setError] = useState<any>(null)
    const { parentData } = useContext(DocContext)
    const pathname = usePathname()
    const landingPage = pathname.startsWith('/uuid')



    

    if (error) {
      return <ErrorMessage error={error} message="Kunne ikke hente dokumentene"/>
    }


    return childrenData && parentData?._source?.uuid && Object.keys(childrenData).length > 0 ?
        <div className="xl:mb-8 instance-info"> 

    {Object.entries<Record<string, any>[]>(childrenData.reduce((acc: Record<string, Record<string, any>[]>, doc: Record<string, any>) => {
         // Group by dataset
        const index = doc._index.split('-')[2]
        if (!acc[index]) acc[index] = []
        acc[index].push(doc)
        return acc
       
    }, {})).map(([docDataset, docs]) => (
        <div key={docDataset}>
            <h3 className="!text-lg border-b border-neutral-200 px-2 !pb-1 !mt-2">{datasetTitles[docDataset]}</h3>
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
