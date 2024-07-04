
'use client'
import { useState, useEffect } from 'react'
import ErrorMessage from '@/components/ErrorMessage'
import { datasetTitles } from '@/config/metadata-config'
import { resultRenderers } from '@/config/result-renderers'
import InfoButton from '@/components/results/infoButton'
import CoordinateButton from '@/components/results/coordinateButton';
import ExternalLinkButton from '@/components/results/externalLinkButton';
import ImageButton from '@/components/results/imageButton';
import Link from 'next/link'


export default function GroupedChildren({ snid, uuid, childList, landingPage, setExpandLoading}: { snid: string, uuid: string, childList: string[], landingPage?: boolean, setExpandLoading?: any}) {
    const [childDocs, setChildDocs] = useState<Record<string, any[]>>({})
    const [error, setError] = useState<any>(null)

    useEffect(() => {
        fetch(`/api/children?${snid ? 'snid=' + snid : (childList.length > 20 ? 'uuids=' + childList.join(',') : 'uuid=' + uuid) }`)
        .then(response => response.json())
        .then(data => {
        // group by index name
        const groupedChildren = data.hits?.hits?.reduce((acc: Record<string, any[]>, doc: Record<string, any>) => {
            const index = doc._index.split('-')[1]
            if (!acc[index]) {
                acc[index] = []
            }
            acc[index].push(doc)
            return acc
          }
          , {})

          setChildDocs(groupedChildren)
          if (setExpandLoading) {
            setExpandLoading(false)
          }
          

        }
        ).catch((error: any) => {
            setError(error)
            if (setExpandLoading) {
              setExpandLoading(false)
            }
            
        })
    }, [snid, uuid, childList, setExpandLoading])
    
    //await fetchChildrenGrouped(childIdentifiers)



    // How doc can be retrieved from index name:
    

    if (error) {
      return <ErrorMessage error={error} message="Kunne ikke hente dokumentene"/>
    }


    return childDocs && Object.keys(childDocs).length > 0 ?
        <div className="p-2 mb-2 space-y-4 transform origin-center"> 
        {Object.keys(childDocs).map((docDataset: string) => (
            <div key={docDataset} className='break-words'>
                { !landingPage && Object.keys(childDocs).length > 1 && <h3 className="small-caps text-xl border-b border-neutral-400 text-neutral-900 font-semibold">{datasetTitles[docDataset]}</h3>}
                { landingPage && <h2 className="!text-lg mt-6">{datasetTitles[docDataset]}</h2> }
                <ul className="list-none">
                  {childDocs[docDataset].map((doc: Record<string, any>, index: number) => {
                    
                    return landingPage ? (
                    <li key={index} className='list-none'>
                        <Link className="no-underline" href={"/uuid/" + doc._source.uuid}>{resultRenderers[docDataset].title(doc)}</Link>
                    </li>
                      )  :
                    (

                    <li key={index} className=''>
                        {resultRenderers[docDataset].title(doc)}
                        {doc._source.sosi && <span> - {doc._source.sosi}</span>}
                        { doc._source.location && <CoordinateButton doc={doc} iconClass="text-2xl inline" parentUuid={uuid} />}
                        { doc._source.link && <ExternalLinkButton doc={doc} iconClass="text-2xl inline" />}
                        { doc._source.image && <ImageButton doc={doc} iconClass="text-2xl inline" />}
                        <InfoButton doc={doc} iconClass="text-2xl inline" />

                    </li>

                    )
                  })}

              



                </ul>
                
            </div>
        ))}
        </div>
    : null
}