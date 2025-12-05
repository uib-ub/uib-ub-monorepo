"use client"
import { modes } from "@/config/metadata-config";
import { useMode } from "@/lib/param-hooks";
import { usePathname } from "next/navigation";

export default function SearchTitle() {
    const pathname = usePathname()
    const mode = useMode()
    if (pathname != "/search") {
        return null
    }


    return <h1 className="sr-only">{modes[mode || 'map'].title}</h1>


}