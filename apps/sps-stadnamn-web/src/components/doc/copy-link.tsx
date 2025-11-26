'use client'
import { useState } from "react";
import { PiCheckBold, PiClipboardBold, PiClipboardFill, PiCopySimple, PiInfinityBold, PiLinkSimple, PiShareFat, PiShareNetwork } from 'react-icons/pi'
import Link from 'next/link'
import { useParams } from 'next/navigation';
import IconButton from "../ui/icon-button";

export default function CopyLink({ uuid, isIconButton, className }: { uuid: string, isIconButton: boolean, className?: string }) {
    const [linkCopied, setLinkCopied] = useState<string|null>(null);

    const copyLink = async () => {
        if (navigator.share) {
        await navigator.share({
            title: 'Del lenke',
            text: 'Del lenke',
            url: `${process.env.NODE_ENV == 'development' ? '': 'https://purl.org/stadnamn'}/uuid/${uuid}`
        });
        }
        else {
        await navigator.clipboard.writeText(`${process.env.NODE_ENV == 'development' ? '': 'https://purl.org/stadnamn'}/uuid/${uuid}`);
        setLinkCopied(uuid);
        }
    };

    if (isIconButton) {
        return (
            <IconButton label="Del lenke" onClick={copyLink} className={className}>
                {linkCopied == uuid ? 
                    <PiCheckBold className="xl:text-xl" aria-hidden="true"/> : 
                    <PiShareFat className="xl:text-xl" aria-hidden="true"/>
                }
            </IconButton>
        )
    }
    else {

    return (
        <button type="button" onClick={copyLink} className={className}>
            <span className="flex items-center gap-2">
                {uuid && linkCopied == uuid ? 
                    <PiCheckBold className="xl:text-xl" aria-hidden="true"/> : 
                    <PiShareFat className="xl:text-xl" aria-hidden="true"/>
                }
                Del
            </span>
            </button>
        );
    }
}