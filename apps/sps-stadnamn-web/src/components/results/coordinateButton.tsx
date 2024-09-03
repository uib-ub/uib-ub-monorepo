'use client'
import { PiMapPinFill } from 'react-icons/pi';
import { useSearchParams, useParams, usePathname } from 'next/navigation';
import IconLink from '../ui/icon-link';

export default function CoordinateButton({doc, iconClass, parentUuid}: {doc: any, iconClass: string, parentUuid?: string}) {
    const searchParams = useSearchParams()
    const params = useParams()
    const docDaataset = doc._index.split('-')[2]
    const pathname = usePathname()
    const docUuid = doc._source?.uuid || doc.fields?.uuid
    const [lat, lon] = doc._source?.location?.coordinates || doc.fields?.location?.coordinates || [0, 0]


    const mapUrl = (uuid: string) => {
        const newSearchParams = new URLSearchParams(searchParams)
        if (newSearchParams.get('display') != 'tree') {
          newSearchParams.delete('display')
        }
        

        if (params.dataset == 'search' && docDaataset != 'search') {
          newSearchParams.set('popup', lon + ',' + lat)
          return `/view/${params.dataset}/doc/${parentUuid}/?${newSearchParams.toString()}`
        }
        else {
          newSearchParams.set('docs', String(uuid))
          return `/view/${params.dataset}?${newSearchParams.toString()}`
        }
      }


    return (
        <IconLink
            href={mapUrl(docUuid)}   
            label="Vis i kart" 
            aria-current={(searchParams.get('docs') == docUuid && pathname == `/view/${params.dataset}`) || (searchParams.get('popup') == lon + ',' + lat) ? 'page': undefined} 
            className="inline-flex items-center justify-center group text-neutral-700">
              <PiMapPinFill className={"group-aria-[current=page]:text-accent-800 align-text-bottom " + iconClass}/>
        </IconLink>  
    )

}