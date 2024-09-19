
'use client'
import Link from "next/link";

import { PiMapTrifold } from "react-icons/pi";
import { useQueryStringWithout } from "@/lib/search-params";
export default function GoToSearchButtons({ dataset }: { dataset: string }) {
    const currentSearch = useQueryStringWithout(['display'])

    return (
        <Link href={ '/view/' + dataset + (currentSearch ? '?' + currentSearch : '') } className="btn btn-outline no-underline"><PiMapTrifold aria-hidden='true' className="mr-2"/>Utforsk kartet</Link>
    )

}