
'use client'
import { useSearchParams, useParams} from "next/navigation";
import Link from "next/link";

import { PiMapTrifold } from "react-icons/pi";
export default function GoToSearchButtons() {
    const params = useParams()
    const currentSearch = useSearchParams().toString()

    return (
        <Link href={ '/view/' + params.dataset + (currentSearch ? '?' + currentSearch : '') } className="btn btn-outline no-underline"><PiMapTrifold aria-hidden='true' className="mr-2"/>Utforsk kartet</Link>
    )

}