'use client'

import CoordinateButton from "@/components/results/coordinateButton"
import IconLink from "@/components/ui/icon-link"
import { useParams, useSearchParams } from "next/navigation"
import { PiInfoFill } from "react-icons/pi"

export default function TreeViewToolbar({hit}: {hit: any}) {
    const params = useParams<{uuid: string; dataset: string}>()
    const searchParams = useSearchParams()


    return (
        <>
        {hit.fields?.location &&
            <CoordinateButton doc={hit} iconClass="text-3xl text-neutral-700"/>
          }
           {false && <IconLink label="Infoside" 
                     href={`/view/${params.dataset}/doc/${hit.fields.uuid}?${searchParams.toString()}`}
                     aria-current={params.uuid && params.uuid == hit.fields.uuid  ? 'page': undefined} 
                     aria-describedby={"resultText_" + hit.fields.uuid}
                     className="inline-flex items-center justify-center text-primary-600 group">
                      <PiInfoFill className={"group-aria-[current=page]:text-accent-800 align-text-bottom text-3xl text-primary-600"}/></IconLink>}

                      </>
    )
    

}