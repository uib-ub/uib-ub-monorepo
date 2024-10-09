import { datasetTitles } from "@/config/metadata-config"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PiDatabase, PiDatabaseFill, PiTag, PiTagFill } from "react-icons/pi"

export default function DocInfo({doc}: {doc: any}) {
    const docDataset = doc._index.split("-")[2]
    const searchParams = useSearchParams()
    const dataset = searchParams.get('dataset') || 'search'

    
    return <article className="instance-info flex flex-col gap-2">
        <h2>{doc._source.label}</h2>
        <div className="flex">
        <Link href="" className="flex items-center gap-1 bg-neutral-100 px-2 rounded-full text-neutral-900 no-underline">{docDataset == 'search' ? <><PiTagFill aria-hidden="true"/> Stadnamn</> : <><PiDatabaseFill aria-hidden="true"/>{datasetTitles[docDataset]}</>}</Link>
        </div>

        
        </article>

}