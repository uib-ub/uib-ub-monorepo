'use client'
import { PiMapPinFill } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import { useSearchParams, useRouter, useParams, usePathname } from 'next/navigation';

export default function CoordinateButton({hit}: {hit: any}) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const params = useParams<{uuid: string; dataset: string}>()




    const showInMap = (uuid: string) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('docs', String(uuid))
        router.push(`/view/${params.dataset}?${newSearchParams.toString()}`)
      }


    return (

        <>

<IconButton 
            onClick={() => showInMap(hit._source.uuid)} 
            label="Vis i kart" 
            aria-current={searchParams.get('docs') == hit._source.uuid && pathname == `/view/${params.dataset}` ? 'page': undefined} 
            className="p-1 text-neutral-700">
              <PiMapPinFill className="text-xl xl:text-3xl"/></IconButton> 
        
        </>

        

    )

}