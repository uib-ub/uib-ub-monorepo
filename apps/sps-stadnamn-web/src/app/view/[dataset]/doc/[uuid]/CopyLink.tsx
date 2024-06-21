'use client'
import { useState } from "react";
import { PiCheckBold, PiClipboardBold, PiLink } from 'react-icons/pi'
import Link from 'next/link'

export default function CopyLink({ uuid }: { uuid: string }) {
    const [linkCopied, setLinkCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://purl.org/stadnamn/uuid/${uuid}`);
    setLinkCopied(true);
  };

    return (
        <span className="flex gap-3">
        <Link href={`https://purl.org/stadnamn/uuid/${uuid}`} className="no-underline inline"><PiLink className="inline"/>Varig infoside</Link>
        <button onClick={copyLink}>
        <span>{linkCopied ? <PiCheckBold className="inline"/> : <PiClipboardBold className="inline"/>}Kopier lenke</span>
        
        </button>
        </span>
    );
}