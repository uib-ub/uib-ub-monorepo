
'use client'
import { useState, useEffect } from 'react'
import ErrorMessage from '@/components/ErrorMessage'
import { datasetTitles } from '@/config/metadata-config'
import { resultRenderers } from '@/config/result-renderers'
import InfoButton from '@/components/results/infoButton'
import Link from 'next/link'


export default function GroupedChildren({ uuid, childList, landingPage}: { uuid: string, childList: string[], landingPage?: boolean}) {
    const [childDocs, setChildDocs] = useState<any>([])
    const [error, setError] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (childList.length > 20) {
          console.log("Too many children to fetch", childList)
        }
        fetch(`/api/children?${childList?.length < 20 ? 'children=' + childList.join(',') : 'parent=' + uuid}`)
        .then(response => response.json())
        .then(data => {
        // group by index name
        const groupedChildren = data.reduce((acc: Record<string, any[]>, doc: Record<string, any>) => {
            const index = doc._index.split('-')[1]
            if (!acc[index]) {
                acc[index] = []
            }
            acc[index].push(doc)
            return acc
          }
          , {})

          setChildDocs(groupedChildren)
          setIsLoading(false)

        }
        ).catch(error => {
            setError(error)
            setIsLoading(false)
        })
    }, [uuid, childList])
    
    //await fetchChildrenGrouped(childIdentifiers)



    // How doc can be retrieved from index name:
    

    if (childDocs.error) {
      return <ErrorMessage error={childDocs} message="Kunne ikke hente attestasjoner"/>
    }


    return (
        <div className="p-2 mb-2"> 
        {isLoading && 
        // skeleton for as many items as in childList, spaced out with two lines for each item, and three circles in place of the buttons on the right side
        <div className="animate-pulse flex flex-col gap-y-2">
          {Array.from({length: childList.length}, (_, i) => (
            <div key={i} className={"h-4 bg-neutral-200 rounded w-1/4"}></div>
          ))}
        </div>
        

        
        }
        {Object.keys(childDocs).map((docDataset: string) => (
            <div key={docDataset} className='break-words'>
                { !landingPage && Object.keys(childDocs).length > 1 && <h3 className="small-caps text-xl">{datasetTitles[docDataset]}</h3>}
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
                        <InfoButton doc={doc} iconClass="text-2xl inline" />

                    </li>

                    )
                  })}

              



                </ul>
                
            </div>
        ))}
        </div>
    )
}