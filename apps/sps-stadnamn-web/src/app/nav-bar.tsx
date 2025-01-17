'use client'
import Link from "next/link";
import { GlobalContext } from "./global-provider";
import { useContext } from "react";
import { useDataset } from "@/lib/search-params";
export default function NavBar({ handleBlur, ...props }: any) {
    const { pinnedFilters } = useContext(GlobalContext)
    const dataset = useDataset()
    return (
        <nav id="top " {...props}>
            <Link onBlur={handleBlur} scroll={false} className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0 xl:hidden" href="/">Til forsiden</Link>
            <Link onBlur={handleBlur} scroll={false} className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0" href={`/search${pinnedFilters[dataset]?.length > 0 ? `?${new URLSearchParams(pinnedFilters[dataset]).toString()}` : ''}`}>Stadnamnsøk</Link>
            <Link onBlur={handleBlur} scroll={false} className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0" href="/help">Søketips</Link>
            <Link onBlur={handleBlur} scroll={false} className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0 override-external-icon" href="https://skjemaker.app.uib.no/view.php?id=16665712">Tilbakemelding</Link>
            <Link onBlur={handleBlur} scroll={false} className="py-3 mx-3 lg:py-1 lg:px-2 lg:mx-0" href="/info">Info</Link>

        </nav>
    )

}