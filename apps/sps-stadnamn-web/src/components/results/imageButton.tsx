'use client'
import { PiArticleFill } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import { useSearchParams, useRouter, useParams, usePathname } from 'next/navigation';
import IconLink from '../ui/icon-link';

export default function ImageButton({doc, iconClass}: {doc: any, iconClass: string}) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const params = useParams<{uuid: string; dataset: string}>()


    const iiifUrl = (uuid: string, manifest: string) => {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('docs', String(uuid))
        return `/view/${params.dataset}/iiif/${manifest}?${newSearchParams.toString()}`
      }


    return (
        <>

<IconLink 
            href={iiifUrl(doc._source.uuid, doc._source.image.manifest)} 
            label="Vis seddel" 
            aria-current={searchParams.get('docs') == doc._source.uuid && pathname.includes('/iiif/') ? 'page': undefined}
            className="inline-flex items-center justify-center text-neutral-700 group">
              <PiArticleFill className={"group-aria-[current=page]:text-accent-800 align-text-bottom " + iconClass}/></IconLink> 
        </>

        

    )

}