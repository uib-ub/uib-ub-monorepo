
'use client'
import { PiInfoFill } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import { useSearchParams, useRouter, useParams, usePathname } from 'next/navigation';
import IconLink from '../ui/icon-link';

export default function InfoButton({doc, iconClass, dataset}: {doc: any, iconClass: string, dataset?: string}) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const params = useParams()

    const newSearchParams = new URLSearchParams(searchParams)
    if (newSearchParams.get('search') == 'show') {
      newSearchParams.set('search', 'hide')
    }
    const uuid = doc._source.children?.length == 1 ? doc._source.children[0] : doc._source.uuid
    const docUrl =  `/view/${dataset || params.dataset }/doc/${uuid}?${newSearchParams.toString()}`
    


    return (

      <IconLink 
      label="Infoside" 
      href={docUrl}
      aria-current={pathname.includes('/doc/') && (params.uuid == doc._source.uuid || (doc._source.children?.length == 1 && doc._source.children[0] == params.uuid)) ? 'page': undefined} 
      aria-describedby={"resultText_" + doc._source.uuid}
      className="inline-flex items-center justify-center text-primary-600 group">
        <PiInfoFill className={"group-aria-[current=page]:text-accent-800 " + iconClass}/></IconLink>

    )

}