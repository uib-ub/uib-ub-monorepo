'use client'
import { useState } from "react";
import { PiCheckBold, PiClipboardBold, PiClipboardFill, PiInfinityBold } from 'react-icons/pi'
import Link from 'next/link'
import { useParams } from 'next/navigation';

export default function CopyLink({ uuid }: { uuid: string }) {
    const [linkCopied, setLinkCopied] = useState<string|null>(null);
    const params = useParams()

  const copyLink = async () => {
    await navigator.clipboard.writeText('https://stadnamnportalen.uib.no/uuid/' + uuid); //(`https://purl.org/stadnamn/uuid/${uuid}`);
    setLinkCopied(uuid);
  };

    return (
        <span className="flex gap-4 flex-wrap">
        <button onClick={copyLink}>
        <span className="flex gap-1 items-center whitespace-nowrap">{linkCopied == uuid ? <PiCheckBold className="inline" aria-hidden="true"/> : <PiClipboardFill className="inline" aria-hidden="true"/>}Kopier lenke</span>
        </button>
        </span>
    );
}