'use client'
import { useState } from "react";
import { PiCheckBold, PiClipboardBold, PiInfinityBold } from 'react-icons/pi'
import Link from 'next/link'
import { useParams } from 'next/navigation';

export default function CopyLink({ uuid }: { uuid: string }) {
    const [linkCopied, setLinkCopied] = useState(false);
    const params = useParams()

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://purl.org/stadnamn/uuid/${uuid}`);
    setLinkCopied(true);
  };

    return (
        <span className="flex gap-4 flex-wrap">
        { params.dataset && <Link href={process.env.NODE_ENV == 'development' ?  `/uuid/${uuid}` : `https://purl.org/stadnamn/uuid/${uuid}`} className="no-underline inline flex gap-1 items-center whitespace-nowrap"><PiInfinityBold aria-hidden="true" className="inline"/>Varig side</Link>}
        <button onClick={copyLink}>
        <span className="flex gap-1 items-center whitespace-nowrap">{linkCopied ? <PiCheckBold className="inline" aria-hidden="true"/> : <PiClipboardBold className="inline" aria-hidden="true"/>}Kopier varig lenke</span>
        
        </button>
        </span>
    );
}