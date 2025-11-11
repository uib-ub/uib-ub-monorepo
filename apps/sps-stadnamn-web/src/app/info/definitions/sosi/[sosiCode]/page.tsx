import { fetchSOSI } from "@/app/api/_utils/actions"
import Breadcrumbs from "@/components/layout/breadcrumbs"
import Link from "next/link"


export async function generateMetadata( { params }: { params: Promise<{ sosiCode: string }> }) {
    const { sosiCode } = await params
    const docData = await fetchSOSI({sosiCode: sosiCode})

    return {
        title: docData?._source?.label || docData?._source.uuid,
        ...(docData?._source?.description && {
            description: docData._source.description
        })
    }
}

export default async function SosiPage({params}: {params: Promise<{sosiCode: string}>}) {
    const { sosiCode } = await params
    
    const doc = await fetchSOSI({sosiCode: sosiCode})
    
    return (
        <div>
            <Breadcrumbs parentName={["Info", "Ordforklaringar", "Lokalitetstypar"]} parentUrl="/info/definitions/sosi" currentName={doc?._source?.label} />
            <h1 className="!text-3xl mt-12">{doc?._source?.label}</h1>
            
            <p>{doc?._source?.definition}</p>
            <p>Namneobjekttype i <Link className="text-sm" href="https://register.geonorge.no/sosi-standarden">SOSI-standaden</Link></p>
            
            <Link href={`https://register.geonorge.no/sosi-kodelister/stedsnavn/navneobjekttype/${doc?._source?.sosiCode}`}>Faktaark i Geonorge</Link>
        </div>
    )
}