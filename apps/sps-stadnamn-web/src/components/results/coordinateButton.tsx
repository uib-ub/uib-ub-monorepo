'use client'
import { PiMapPinFill } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import { useSearchParams, useRouter, useParams, usePathname } from 'next/navigation';

export default function CoordinateButton({hit}: {hit: any}) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const dataset = hit._index.split('-')[1]


    const showInMap = (uuid: string) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('docs', String(uuid))
        router.push(`/view/${dataset}?${newSearchParams.toString()}`)
      }


    return (

        <>

<IconButton 
            onClick={() => showInMap(hit._id)} 
            label="Vis i kart" 
            aria-current={searchParams.get('docs') == hit._id && pathname == `/view/${dataset}` ? 'page': undefined} 
            className="p-1 text-neutral-700">
              <PiMapPinFill className="text-xl xl:text-3xl"/></IconButton> 
        
        </>

        

    )

}