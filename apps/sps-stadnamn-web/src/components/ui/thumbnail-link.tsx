

import Link from "next/link"
import Thumbnail from "./thumbnail"


export default async function ThumbnailLink({ doc, docDataset, dataset, searchParams }: { doc: any, docDataset: string, dataset?: string, searchParams?: any}) {

        let paramsString
        if (searchParams) {
            const newSearchParams = new URLSearchParams(searchParams)
            newSearchParams.set('docs', String(doc._source.uuid))
            paramsString = newSearchParams.toString()
        }
        
        
        const iiifLink = dataset ? `/view/${dataset}/iiif/${doc._source.image.manifest}${paramsString ? '?' + paramsString : ''}` : '/iiif/' + doc._source.image.manifest
      

    return <Link href={iiifLink}><Thumbnail manifestId={doc._source.image.manifest} docDataset={docDataset}/></Link>

}