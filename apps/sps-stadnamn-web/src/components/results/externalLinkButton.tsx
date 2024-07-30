import { PiLinkBold } from 'react-icons/pi';
import IconLink from '../ui/icon-link';

export default function ExternalLinkButton({doc, iconClass}: {doc: any, iconClass: string}) {

    return (
        <IconLink href={doc._source.link} label="Ekstern ressurs" className="inline-flex items-center justify-center group text-neutral-700 xl:text-xl">
          <i aria-hidden="true">
            <PiLinkBold  className={iconClass}/>
          </i>  
        </IconLink>
    )

}