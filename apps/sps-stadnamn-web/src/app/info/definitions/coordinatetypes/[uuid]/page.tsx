import { fetchDoc } from "@/app/api/_utils/actions"
import Breadcrumbs from "@/components/layout/breadcrumbs"
import Link from "next/link"


export async function generateMetadata( { params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params
    const docData = await fetchDoc({uuid: uuid})

    return {
        title: docData?._source?.label || docData?._source.uuid,
        ...(docData?._source?.description && {
            description: docData._source.description
        })
    }
}

export default async function CoordinateTypePage({params}: {params: Promise<{uuid: string}>}) {
    const { uuid } = await params
    
    const doc = await fetchDoc({uuid: uuid})
    
    return (
        <div>
            <Breadcrumbs parentName={["Info", "Ordforklaringar", "Lokalitetstypar"]} parentUrl="/info/definitions/sosi" currentName={doc?._source?.label} />
            <h1 className="!text-3xl mt-12">{doc?._source?.label}</h1>
            
            <p>{doc?._source?.definition}</p>

            

        </div>
    )
}