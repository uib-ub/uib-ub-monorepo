import Clickable from "@/components/ui/clickable/clickable"
import { useSearchQuery } from "@/lib/search-params"
import { stringToBase64Url } from "@/lib/utils"
import { useEffect, useState } from "react"

export default function RootWords({hit}: {hit: any}) {

    const {searchQueryString } = useSearchQuery()

    const [ rootWords, setRootWords] = useState<any[]>([])
    const [ isLoadingRootWords, setIsLoadingRootWords] = useState(false)

    useEffect(() => {
        if (hit.inner_hits?.group?.hits?.total?.value > 1) {
        setIsLoadingRootWords(true)
        const url = `/api/search/collapsed?${searchQueryString}&group=${stringToBase64Url('grunnord')}&dataset=*_g`
        fetch(url, {cache: 'force-cache', next: {tags: ['all']}})
          .then(response => {
            if (!response.ok) {
                setIsLoadingRootWords(false)
              throw response
            }
            return response.json()
          })
          .then(es_data => {
  
            setRootWords(es_data.hits.hits)
          })
          .finally(() => setIsLoadingRootWords(false))
        }
        else {
            setRootWords([hit])
        }
      }, [searchQueryString, hit])

    // Group words by label and count their occurrences across indices
    const groupedWords = rootWords.reduce((acc, word) => {
        const label = word.fields.label[0]
        if (!acc[label]) {
            acc[label] = {
                label,
                indices: new Set([word._index]),
                id: word._id
            }
        } else {
            acc[label].indices.add(word._index)
        }
        return acc
    }, {} as Record<string, { label: string, indices: Set<string>, id: string }>)

    return (
        <div className="w-full h-full mb-3 flex flex-col gap-2 mx-2">
            <strong className="uppercase font-semibold text-neutral-800 text-sm">Grunnord</strong>
            <ul className="flex flex-wrap gap-2">
                
                {isLoadingRootWords ? (
                    <>
                        <div className="h-8 w-16 bg-neutral-900/10 animate-pulse rounded-md"></div>
                        <div className="h-8 w-16 bg-neutral-900/10 animate-pulse rounded-md"></div>
                    </>
                ) : (
                    Object.values(groupedWords)
                        .map((word: any) => (
                            <li key={word.id}>
                            <Clickable link 
                                       add={{
                                        doc: word.fields?.uuid?.[0],
                                        ...(word.indices.size > 1 ? {group: stringToBase64Url("grunnord_" + word.label)} : {}),
                                       }}
                                       className={`btn btn-outline flex items-center gap-2 ${word.indices.size > 1 ? 'pr-3' : ''}`}>
                                {word.label}
                                {word.indices.size > 1 && <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full">
                                    {word.indices.size}
                                </span>}
                            </Clickable>
                            </li>
                        ))
                )}
                
            </ul>
            {/* List them with counts for each word if they occur in more than one dataset */}
        </div>
    )
}