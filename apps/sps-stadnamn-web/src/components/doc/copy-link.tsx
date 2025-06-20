'use client'
import { useState } from "react";
import { PiCheckBold, PiClipboardBold, PiClipboardFill, PiCopySimple, PiInfinityBold, PiLinkSimple } from 'react-icons/pi'
import Link from 'next/link'
import { useParams } from 'next/navigation';
import IconButton from "../ui/icon-button";

export default function CopyLink({ uuid, className }: { uuid: string, className?: string }) {
    const [linkCopied, setLinkCopied] = useState<string|null>(null);
    const params = useParams()

    const copyLink = async () => {
        await navigator.clipboard.writeText(`${process.env.NODE_ENV == 'development' ? '': 'https://purl.org/stadnamn'}/uuid/${uuid}`);
        setLinkCopied(uuid);
    };

    return (
        <button type="button" onClick={copyLink} className={className}>
            <span className="flex items-center gap-2">
                {linkCopied == uuid ? 
                    <PiCheckBold className="text-xl" aria-hidden="true"/> : 
                    <PiCopySimple className="text-xl" aria-hidden="true"/>
                }
                Kopier lenke
            </span>
        </button>
    );
}