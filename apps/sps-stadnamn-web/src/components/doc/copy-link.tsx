'use client'
import { useState } from "react";
import { PiCheckBold, PiClipboardBold, PiClipboardFill, PiInfinityBold, PiLinkSimple } from 'react-icons/pi'
import Link from 'next/link'
import { useParams } from 'next/navigation';

export default function CopyLink({ uuid, className }: { uuid: string, className?: string }) {
    const [linkCopied, setLinkCopied] = useState<string|null>(null);
    const params = useParams()

    const copyLink = async () => {
        await navigator.clipboard.writeText('https://stadnamnportalen.uib.no/uuid/' + uuid);
        setLinkCopied(uuid);
    };

    return (
        <button onClick={copyLink} className={className}>
            <span className="flex items-center gap-2">
                {linkCopied == uuid ? 
                    <PiCheckBold className="text-xl" aria-hidden="true"/> : 
                    <PiLinkSimple className="text-xl" aria-hidden="true"/>
                }
                Kopier lenke
            </span>
        </button>
    );
}