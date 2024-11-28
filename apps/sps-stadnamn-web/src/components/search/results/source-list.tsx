
'use client'
import { useState, useEffect } from 'react'
import ErrorMessage from '@/components/error-message'
import { datasetTitles } from '@/config/metadata-config'
import { resultRenderers } from '@/config/result-renderers'
import CoordinateButton from '@/components/results/coordinateButton';
import ExternalLinkButton from '@/components/results/externalLinkButton';
import ImageButton from '@/components/results/image-button';
import ResultLink from '@/components/results/result-link'


export default function SourceList({ snid, uuid, childList, landingPage}: { snid: string, uuid: string, childList: string[], landingPage?: boolean}) {
    const [childDocs, setChildDocs] = useState<Record<string, any[]>>({})
    const [error, setError] = useState<any>(null)

    useEffect(() => {
        fetch(`/api/children?${snid ? 'snid=' + snid : (childList.length > 20 ? 'uuids=' + childList.join(',') : 'uuid=' + uuid) }`)
        .then(response => response.json())
        .then(data => {
        // group by index name
        const groupedChildren = data.hits?.hits?.reduce((acc: Record<string, any[]>, doc: Record<string, any>) => {
            const index = doc._index.split('-')[2]
            if (!acc[index]) {
                acc[index] = []
            }
            acc[index].push(doc)
            return acc
          }
          , {})

          setChildDocs(groupedChildren)
          

        }
        ).catch((error: any) => {
            setError(error)
            
        })
    }, [snid, uuid, childList])
    
    //await fetchChildrenGrouped(childIdentifiers)



    // How doc can be retrieved from index name:
    

    if (error) {
      return <ErrorMessage error={error} message="Kunne ikke hente dokumentene"/>
    }


    return childDocs && Object.keys(childDocs).length > 0 ?
        <div className="mb-8 space-y-4 transform origin-center"> 
        {Object.keys(childDocs).map((docDataset: string) => (
            <div key={docDataset} className='break-words'>
                { !landingPage && <h4 className="border-b border-neutral-400 text-neutral-900 font-semibold">{datasetTitles[docDataset]}</h4>}
                { landingPage && <h2 className="!text-lg mt-6">{datasetTitles[docDataset]}</h2> }
                <ul className="list-none space-y-2 my-2">
                  {childDocs[docDataset].map((doc: Record<string, any>, index: number) => {
                    try {
                    return landingPage ? (
                    <li key={index} className='list-none'>
                        <ResultLink doc={doc}>{resultRenderers[docDataset]?.title(doc, 'grouped') || docDataset} {resultRenderers[docDataset]?.details(doc, 'grouped')}</ResultLink>
                    </li>
                      )  :
                    (

                    <li key={index} className='flex items-center'>
                        <ResultLink doc={doc}>{resultRenderers[docDataset]?.title(doc, 'grouped')} {resultRenderers[docDataset]?.details(doc, 'grouped')}</ResultLink>

                        <span className="space-x-1 mx-2">
                        { doc.fields.location && <CoordinateButton doc={doc} iconClass="text-2xl inline" parentUuid={uuid} />}
                        { doc.fields.link && <ExternalLinkButton doc={doc} iconClass="text-2xl inline" />}
                        { doc.fields.image && <ImageButton doc={doc} iconClass="text-2xl inline" />}
                        </span>

                    </li>

                    )
                    } catch (e) {
                      return <div>Error: {JSON.stringify(doc)}</div>
                    }


                  })}

              



                </ul>
                
            </div>
        ))}
        </div>
    : null
}