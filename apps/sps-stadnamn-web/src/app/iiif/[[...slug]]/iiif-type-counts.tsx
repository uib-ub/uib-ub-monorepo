import { PiArchiveFill, PiFileFill } from "react-icons/pi";

export default function IIIFTypeCounts({typeCounts}: {typeCounts: any}) {
    return <div className="flex items-center gap-2">
        {typeCounts.map((type: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-neutral-900 px-2 py-1 rounded-md">
                {type.key == 'Collection' ? <PiArchiveFill aria-hidden="true" className="text-xl" /> : <PiFileFill aria-hidden="true" className="text-xl" />}
                <span>{type.doc_count}</span>
            </div>
        ))}
    </div>

}
