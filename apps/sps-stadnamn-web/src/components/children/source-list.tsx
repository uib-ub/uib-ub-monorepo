'use client'
import { useState, useContext } from 'react'
import ErrorMessage from '@/components/error-message'
import { DocContext } from '@/app/doc-provider'
import { ChildrenContext } from '@/app/children-provider' 
import { datasetTitles } from '@/config/metadata-config'
import SourceItem from './source-item'
import { GlobalContext } from '@/app/global-provider'

export default function SourceList() {
    const { childrenData, childrenLoading, sourceChildren } = useContext(ChildrenContext)
    const [error, setError] = useState<any>(null)
    const { parentData, parentLoading } = useContext(DocContext)
    const { isMobile } = useContext(GlobalContext)

    if (error) {
      return <ErrorMessage error={error} message="Kunne ikke hente dokumentene"/>
    }


    return !childrenLoading && !parentLoading && childrenData && parentData?._source?.uuid ? (
        <div className="xl:mb-8 instance-info flex flex-col gap-2"> 
            {Object.entries(sourceChildren || {}).map(([docDataset, docs]: [string, any[]]) => (
                <div key={docDataset}>
                    <h3 className="!text-base uppercase  !font-sans border-b border-neutral-200 px-2 !pb-1 !mt-0">{datasetTitles[docDataset]}</h3>
                    <ul className="!p-0 divide-y divide-neutral-200 gap-2" aria-live="polite">
                        {docs.map((doc: Record<string, any>) => (
                            <li key={doc._id} className="flex flex-grow !p-0 !m-0">
                            <SourceItem hit={doc} isMobile={isMobile}/>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    ) : null
}
