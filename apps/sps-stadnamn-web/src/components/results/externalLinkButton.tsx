import { PiLinkBold } from 'react-icons/pi';
import Link from 'next/link';

export default function ExternalLinkButton({doc, iconClass}: {doc: any, iconClass: string}) {

    return (

        <Link href={doc._source.link} aria-label="Ekstern ressurs" className="p-1 text-neutral-700 xl:text-xl no-underline !inline-block" target="_blank">
          <i aria-hidden="true">
            <PiLinkBold  className={iconClass}/>
          </i>
               
        </Link>

    )

}