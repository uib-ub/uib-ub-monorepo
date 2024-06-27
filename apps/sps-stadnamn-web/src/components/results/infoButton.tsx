
'use client'
import { PiInfoFill } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import { useSearchParams, useRouter, useParams, usePathname } from 'next/navigation';

export default function InfoButton({doc, iconClass, dataset}: {doc: any, iconClass: string, dataset?: string}) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const params = useParams()


    const goToDoc = (uuid: string) => {
      const newSearchParams = new URLSearchParams(searchParams)
      router.push(`/view/${dataset || params.dataset }/doc/${uuid}?${newSearchParams.toString()}`)
    }


    return (

      <IconButton 
      onClick={() => goToDoc(doc._source.uuid)} 
      label="Infoside" 
      aria-current={params.uuid == doc._source.uuid && pathname.includes('/doc/') ? 'page': undefined} 
      aria-describedby={"resultText_" + doc._source.uuid}
      className="p-1 text-primary-600 group">
        <PiInfoFill className={"group-aria-[current=page]:text-accent-800 " + iconClass}/></IconButton>

    )

}