'use client'
import { useState } from "react";
import { PiCheckBold, PiClipboardBold, PiInfinityBold, PiShareNetwork } from 'react-icons/pi'
import Link from 'next/link'

export default function CopyLink({ uuid }: { uuid: string }) {
    const [linkCopied, setLinkCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://purl.org/stadnamn/uuid/${uuid}`);
    setLinkCopied(true);
  };

    return (
        <span className="flex gap-3">
        <Link href={process.env.NODE_ENV == 'development' ?  `/uuid/${uuid}` : `https://purl.org/stadnamn/uuid/${uuid}`} className="no-underline inline flex gap-1 items-center"><PiInfinityBold aria-hidden="true" className="inline"/>Varig infoside</Link>
        <button onClick={copyLink}>
        <span className="flex gap-1 items-center">{linkCopied ? <PiCheckBold className="inline" aria-hidden="true"/> : <PiClipboardBold className="inline" aria-hidden="true"/>}Kopier lenke</span>
        
        </button>
        </span>
    );
}