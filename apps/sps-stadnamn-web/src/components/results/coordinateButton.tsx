'use client'
import { PiMapPinFill } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import { useSearchParams, useRouter, useParams, usePathname } from 'next/navigation';

export default function CoordinateButton({doc, iconClass}: {doc: any, iconClass: string}) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const params = useParams()


    const showInMap = (uuid: string) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('docs', String(uuid))
        router.push(`/view/${params.dataset}?${newSearchParams.toString()}`)
      }


    return (
        <IconButton 
            onClick={() => showInMap(doc._source.uuid)} 
            label="Vis i kart" 
            aria-current={searchParams.get('docs') == doc._source.uuid && pathname == `/view/${params.dataset}` ? 'page': undefined} 
            className="p-1 text-neutral-700 group">
              <PiMapPinFill className={"group-aria-[current=page]:text-accent-800  " + iconClass}/>
        </IconButton>  
    )

}