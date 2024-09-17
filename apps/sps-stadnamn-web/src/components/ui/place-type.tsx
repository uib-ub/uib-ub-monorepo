
//import { fetchSOSI } from '@/app/api/_utils/actions'
import Link from "next/link";

export default async function PlaceType({ sosiCode }: { sosiCode: string }) {
    //const data = await fetchSOSI(sosiCode)

    return (
        <Link className="inline whitespace-nowrap"
            href={"https://register.geonorge.no/sosi-kodelister/stedsnavn/navneobjekttype/" + sosiCode}>
        {sosiCode}
        </Link>
    
    )

    
}