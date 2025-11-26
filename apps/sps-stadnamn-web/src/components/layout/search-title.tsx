"use client"
import { GlobalContext } from "@/state/providers/global-provider";
import { useMode } from "@/lib/param-hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { modes } from "@/config/metadata-config";

export default function SearchTitle() {
    const pathname = usePathname()
    const mode = useMode()
    if (pathname != "/search") {
        return null
    }

    
    return <h1 className="sr-only">{modes[mode || 'map'].title}</h1>

        
}

/*return <div className="flex sr-only xl:not-sr-only z-[4000] h-full !px-2 items-center mr-auto !py-2 bg-neutral-50/90 rounded-lg">
        <Link href="/" scroll={false} className="text-xl no-underline px-3">stadnamn.no</Link>
        <Link className="no-underline" href={`/search${mode != 'map' ? '?mode=' + mode : ''}`}><h1 className="!text-lg px-3 truncate border-l-2 border-primary-300">{modes[mode || 'map'].title}</h1></Link>
        </div>
        */
