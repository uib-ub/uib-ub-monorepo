'use client'
import { PiMapPinFill } from 'react-icons/pi';
import { useSearchParams, useRouter, useParams, usePathname } from 'next/navigation';
import IconLink from '../ui/icon-link';

export default function CoordinateButton({doc, iconClass, parentUuid}: {doc: any, iconClass: string, parentUuid?: string}) {
    const searchParams = useSearchParams()
    const params = useParams()
    const docDaataset = doc._index.split('-')[1]
    const pathname = usePathname()


    const mapUrl = (uuid: string) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('display')

        if (params.dataset == 'search' && docDaataset != 'search') {
          newSearchParams.set('popup', doc._source.location.coordinates[1] + ',' + doc._source.location.coordinates[0])
          return `/view/${params.dataset}/doc/${parentUuid}/?${newSearchParams.toString()}`
        }
        else {
          newSearchParams.set('docs', String(uuid))
          return `/view/${params.dataset}?${newSearchParams.toString()}`
        }
      }


    return (
        <IconLink
            href={mapUrl(doc._source.uuid)} 
            label="Vis i kart" 
            aria-current={(searchParams.get('docs') == doc._source.uuid && pathname == `/view/${params.dataset}`) || (searchParams.get('popup') == doc._source.location.coordinates[1] + ',' + doc._source.location.coordinates[0]) ? 'page': undefined} 
            className="inline-flex items-center justify-center group text-neutral-700">
              <PiMapPinFill className={"group-aria-[current=page]:text-accent-800 align-text-bottom " + iconClass}/>
        </IconLink>  
    )

}