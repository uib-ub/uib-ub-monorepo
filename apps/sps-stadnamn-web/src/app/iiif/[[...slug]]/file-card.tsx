import Link from "next/link";
import { PiArchiveThin, PiBankThin, PiFileAudioThin } from "react-icons/pi";
import { resolveLanguage } from "../iiif-utils";

export default function FileCard({ item, itemDataset, currentItem }: { item: any, itemDataset: string, currentItem?: string }) {

    const height = 160
    const width = 240
    const aspectRatio = height / width
    const canvasWidth = item?.images?.[0]?.width
    const canvasCount = item?.images?.length
    const image = item?.images?.[0].uuid
    const type = item?.type
    const thumbnail = `https://iiif.spraksamlingane.no/iiif/image/stadnamn/${itemDataset.toUpperCase()}/${image}/0,0,${canvasWidth},${Math.round(canvasWidth * aspectRatio)}/${width * 2},${height * 2}/0/default.tif`

    return <Link
        href={`/iiif/${item.uuid}`}
        className={`flex ${type == 'Manifest' ? 'flex-col' : 'xl:flex-col'} h-full w-full items-center gap-2 no-underline bg-white shadow-md p-2 rounded-md min-h-[56px] aria-[current=page]:bg-accent-900 aria-[current=page]:text-white`}
        aria-current={item.uuid == currentItem ? "page" : undefined}>
        {type === 'Collection' && (
            <>
                {/* Mobile: compact row icon; Desktop: match audio layout */}
                <div className="flex items-center justify-center w-10 h-10 shrink-0 xl:w-auto xl:h-auto xl:flex-1">
                    <div className="flex items-center justify-center xl:w-full xl:h-full">
                        {item?.partOf ? <PiArchiveThin aria-hidden="true" className="text-2xl xl:w-full xl:h-full xl:p-6 xl:text-8xl" /> : <PiBankThin aria-hidden="true" className="text-2xl xl:w-full xl:h-full xl:p-6 xl:text-8xl" />}
                    </div>

                </div>
                <span className="truncate w-full text-left xl:text-center">{resolveLanguage(item.label)}</span>
            </>
        )}
        {type == 'Manifest' && item.images && (
            <>

                <div className="relative h-full w-full aspect-[16/9] overflow-hidden">
                    <img
                        className="w-full h-full object-cover block bg-neutral-800 border border-neutral-200"
                        src={thumbnail}
                        alt={resolveLanguage(item.label)}
                    />
                    {canvasCount > 1 && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90 flex items-center justify-center bg-neutral-900 text-white aspect-square rounded-full p-1 px-3 font-semibold text-sm shadow-md">
                        {canvasCount}

                    </div>
                    }
                </div>
                <span className="truncate w-full text-center">


                    {resolveLanguage(item.label)}


                </span>

            </>
        )}
        {
            type == 'Manifest' && item.audio && (
                <>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex items-center justify-center"><PiFileAudioThin aria-hidden="true" className="w-full h-full p-6 text-8xl" /></div>
                    </div>
                    <span className="truncate w-full text-center">
                        {resolveLanguage(item.label)}
                    </span>
                </>
            )
        }

    </Link>
}

