
'use client'
import { PiInfoFill } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import { useSearchParams, useRouter, useParams, usePathname } from 'next/navigation';

export default function InfoButton({hit}: {hit: any}) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const params = useParams<{uuid: string; dataset: string}>()
    const dataset = hit._index.split('-')[1]


    const goToDoc = (uuid: string) => {
      const newSearchParams = new URLSearchParams(searchParams)
      router.push(`/view/${dataset}/doc/${uuid}?${newSearchParams.toString()}`)
    }


    return (

      <IconButton 
      onClick={() => goToDoc(hit._source.uuid)} 
      label="Infoside" 
      aria-current={params.uuid == hit._source.uuid && pathname.includes('/doc/') ? 'page': undefined} 
      className="p-1 text-primary-600">
        <PiInfoFill className="text-xl xl:text-3xl"/></IconButton>

    )

}