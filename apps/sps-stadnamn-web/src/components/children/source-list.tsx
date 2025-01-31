'use client'
import { useState, useContext, useEffect } from 'react'
import ErrorMessage from '@/components/error-message'
import { DocContext } from '@/app/doc-provider'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChildrenContext } from '@/app/children-provider' 
import { datasetTitles } from '@/config/metadata-config'
import SourceItem from './source-item'
import { useQueryState } from 'nuqs'

export default function SourceList() {
    const { childrenData, childrenLoading, childrenError, sourceChildren } = useContext(ChildrenContext)
    const [error, setError] = useState<any>(null)
    const [filteredData, setFilteredData] = useState<[string, Record<string, any>[]][]>([])
    const { parentData, parentLoading } = useContext(DocContext)
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const landingPage = pathname.startsWith('/uuid')



    if (error) {
      return <ErrorMessage error={error} message="Kunne ikke hente dokumentene"/>
    }


    return !childrenLoading && !parentLoading && childrenData && parentData?._source?.uuid ? (
        <div className="xl:mb-8 instance-info"> 
            {Object.entries(sourceChildren || {}).map(([docDataset, docs]: [string, any[]]) => (
                <div key={docDataset}>
                    <h3 className="!text-base uppercase  !font-sans border-b border-neutral-200 px-2 !pb-1 !mt-2">{datasetTitles[docDataset]}</h3>
                    <ul className="!p-0 divide-y divide-neutral-200">
                        {docs.map((doc: Record<string, any>) => (
                            <SourceItem key={doc._id} hit={doc} isMobile={false}/>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    ) : null
}
