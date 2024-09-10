
import { PiLink } from "react-icons/pi";
import { fetchSOSI } from '@/app/api/_utils/actions'
import Link from "next/link";

export default async function PlaceType({ sosiCode }: { sosiCode: string }) {
    const data = await fetchSOSI(sosiCode)

    return (
        data.id ?
        <Link className="inline whitespace-nowrap"
            href={data.id}>
        {data.label}
        </Link>
        :
        sosiCode
    )

    
}