import Link from "next/link";
import { PiArchiveDuotone, PiArchiveFill, PiArchiveThin, PiFileAudioThin } from "react-icons/pi";
import Image from "next/image";
import { resolveLanguage, resolveLanguageField } from "../iiif-utils";



export default function FileCard({fields, itemDataset, currentItem}: {fields: any, itemDataset: string, currentItem?: string}) {
    const height = 160
    const width = 240
    const aspectRatio = height / width
    console.log(fields?.["canvases.image"]?.length)
    const canvasWidth = fields?.["canvases.width"]?.[0]
    const canvasHeight = fields?.["canvases.height"]?.[0]
    const canvasCount = fields?.["canvases.image"]?.length
    const image = fields?.["canvases.image"]?.[0]  
    const type = fields?.["type"]?.[0]
    const thumbnail = `https://iiif.test.ubbe.no/iiif/image/stadnamn/${itemDataset.toUpperCase()}/${image}/0,0,${canvasWidth},${Math.round(canvasWidth*aspectRatio)}/${width*2},${height*2}/0/default.jpg`

    return <Link
    href={`/iiif/${fields.uuid}`} 
    className="flex flex-col items-center gap-2 no-underline bg-white shadow-md p-2 pt-4 rounded-md aria-[current=page]:bg-accent-900 aria-[current=page]:text-white"
    aria-current={fields.uuid == currentItem ? "page" : undefined}
>
    {type === 'Collection' && (
        <>
            <div className="flex items-center justify-center"><PiArchiveThin aria-hidden="true" className="text-8xl w-full h-full p-6" /></div>
            {resolveLanguageField(fields)}
        </>
    )}
    
    {type == 'Manifest' && canvasCount > 0 && (
        <>
        <div className="relative">
            <Image 
                className="bg-neutral-800 border border-neutral-200"
                src={thumbnail} 
                alt={resolveLanguageField(fields)} 
                width={width}
                height={height}
            />
            { canvasCount > 1 && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-white text-neutral-900 rounded-full p-1 px-3 font-semibold text-sm shadow-md">
            {canvasCount}

            </div>
            }
        </div>
            <span className="flex items-center gap-1 truncate">
                
                
                {resolveLanguageField(fields)}
                
                
                </span>
                
        </>
    )}
    {
        type == 'Manifest' && fields["audio.uuid"] && (
            <>
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center justify-center"><PiFileAudioThin aria-hidden="true" className="w-full h-full p-6 text-8xl" /></div>
                </div>
                <span className="flex items-center gap-1 truncate">
                    {resolveLanguageField(fields)}
                </span>
            </>
        )
    }

    </Link>
}

