import Link from "next/link";
import { PiArchiveThin, PiFileAudioThin } from "react-icons/pi";
import Image from "next/image";
import { resolveLanguage, resolveLanguageField } from "./iiif-utils";



export default function FileCard({fields, itemDataset, currentItem}: {fields: any, itemDataset: string, currentItem?: string}) {
    const height = 240
    const canvasWidth = fields?.["canvases.width"]?.[0]
    const canvasHeight = fields?.["canvases.height"]?.[0]
    const canvasCount = fields?.["canvases.image"]?.length
    const image = fields?.["canvases.image"]?.[0]  
    const width = Math.round((canvasWidth / canvasHeight) * height)
    const type = fields?.["type"]?.[0]

    return <Link
    href={`/iiif/${fields.uuid}`} 
    className="flex flex-col items-center gap-2 no-underline bg-white shadow-md hover:bg-neutral-50 p-2 pt-4 rounded-md overflow-auto aria-[current=page]:bg-accent-900 aria-[current=page]:text-white"
    aria-current={fields.uuid == currentItem ? "page" : undefined}
>
    {type === 'Collection' && (
        <>
            <PiArchiveThin aria-hidden="true" className="text-6xl" />
            {resolveLanguageField(fields)}
        </>
    )}
    {type == 'Manifest' && canvasCount > 0 && (
        <>
            <Image 
                className="bg-neutral-800 border border-neutral-200 object-cover object-center"
                src={`https://iiif.test.ubbe.no/iiif/image/stadnamn/${itemDataset.toUpperCase()}/${image}/full/${width},${height}/0/default.jpg`} 
                alt={resolveLanguageField(fields)} 
                width={width}
                height={height}
            />
            <span className="flex items-center gap-1">
                
                
                {resolveLanguageField(fields)}
                {canvasCount > 1 && <span className="flex items-center gap-1 ml-auto">({canvasCount} sedler)</span>}
                
                </span>
                
        </>
    )}
    {
        type == 'Manifest' && fields["audio.uuid"] && (
            <>
                <div className="flex-1 flex items-center justify-center">
                    <PiFileAudioThin aria-hidden="true" className="text-6xl" />
                </div>
                <span className="flex items-center gap-1">
                    {resolveLanguageField(fields)}
                </span>
            </>
        )
    }

    </Link>
}

