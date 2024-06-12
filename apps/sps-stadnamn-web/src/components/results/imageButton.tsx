'use client'
import { PiArticleFill } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import { useSearchParams, useRouter, useParams, usePathname } from 'next/navigation';

export default function ImageButton({hit}: {hit: any}) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const dataset = hit._index.split('-')[1]


    const goToIIIF = (uuid: string, manifest: string) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('docs', String(uuid))
        router.push(`/view/${dataset}/iiif/${manifest}?${newSearchParams.toString()}`)
      }


    return (
        <>

<IconButton 
            onClick={() => goToIIIF(hit._source.uuid, hit._source.image.manifest)} 
            label="Vis seddel" 
            aria-current={searchParams.get('docs') == hit._source.uuid && pathname.includes('/iiif/') ? 'page': undefined}
            className="p-1 text-neutral-700">
              <PiArticleFill className="text-xl xl:text-3xl"/></IconButton> 
        </>

        

    )

}