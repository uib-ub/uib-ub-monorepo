import { PiLinkBold } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import Link from 'next/link';

export default function ExternalLinkButton({hit}: {hit: any}) {

    return (

        <Link href={hit._source.link} className="no-underline" target="_blank">
          <IconButton 
            label="Ekstern ressurs"
            className="p-1 text-neutral-700 xl:text-xl">
               <PiLinkBold className="text-xl xl:text-3xl"/>
          </IconButton> 
        </Link>

    )

}