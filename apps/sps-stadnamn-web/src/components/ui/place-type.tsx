
import { PiLink } from "react-icons/pi";
import { fetchSOSI } from '@/app/api/_utils/actions'
import Link from "next/link";

export default async function PlaceType({ sosiCode }: { sosiCode: string }) {
    const data = await fetchSOSI(sosiCode)

    return (
        data.id ?
        <Link className="no-underline flex items-center gap-1"
            href={data.id}
            target="_blank"
            >
        {data.label}
        <PiLink aria-hidden={true} className="inline text-primary-600"/>
        </Link>
        :
        sosiCode
    )

    
}