'use client'
import { PiMapPinFill } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import { useSearchParams, useRouter, useParams, usePathname } from 'next/navigation';

export default function CoordinateButton({doc, iconClass, parentUuid}: {doc: any, iconClass: string, parentUuid?: string}) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const params = useParams()
    const docDaataset = doc._index.split('-')[1]
    const pathname = usePathname()


    const showInMap = (uuid: string) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.delete('display')

        if (params.dataset == 'search' && docDaataset != 'search') {
          newSearchParams.set('popup', doc._source.location.coordinates[1] + ',' + doc._source.location.coordinates[0])
          router.push(`/view/${params.dataset}/doc/${parentUuid}/?${newSearchParams.toString()}`)
        }
        else {
          newSearchParams.set('docs', String(uuid))
          router.push(`/view/${params.dataset}?${newSearchParams.toString()}`)
        }
      }


    return (
        <IconButton 
            onClick={() => showInMap(doc._source.uuid)} 
            label="Vis i kart" 
            aria-current={(searchParams.get('docs') == doc._source.uuid && pathname == `/view/${params.dataset}`) || (searchParams.get('popup') == doc._source.location.coordinates[1] + ',' + doc._source.location.coordinates[0]) ? 'page': undefined} 
            className="p-1 text-neutral-700 group">
              <PiMapPinFill className={"group-aria-[current=page]:text-accent-800  " + iconClass}/>
        </IconButton>  
    )

}