'use client'
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useState } from "react"
import { PiCaretLeft, PiCaretRight, PiArchiveThin } from "react-icons/pi"
import { resolveLanguage } from "@/app/iiif/iiif-utils"


async function fetchManifest(iiif: string | string[], imgIndex: number, width: number, aspectRatio: number) {
    let response: Response
    if (Array.isArray(iiif)) {
        response = await fetch(`api/doc?uuid=${iiif[imgIndex]}&dataset=iiif_*`)
    } else {
        response = await fetch(`api/doc?uuid=${iiif}&dataset=iiif_*`)
    }
    const data = await response.json()

    const dataset = data.hits.hits[0]._index.split("-")[2].split("_")[1]
    const source = data.hits.hits[0]._source
    const manifestType = source.type
    const outputWidth = width * 2
    const outputHeight = Math.round(outputWidth * (9 / 16))
    const thumbnailUrl = manifestType === 'Collection' || !source.images?.[0] ? null : `https://iiif.spraksamlingane.no/iiif/image/stadnamn/${dataset.toUpperCase()}/${source.images[0].uuid}/0,0,${source.images[0].width},${Math.round(source.images[0].width * aspectRatio)}/${outputWidth},${outputHeight}/0/default.jpg`
    return {
        thumbnailUrl,
        manifestUuid: source.uuid,
        manifestType,
        label: source.label,
    }
}


export default function ClientThumbnail({ iiif, datasetLabel }: { iiif: string | string[], datasetLabel?: string }) {
    const [imgIndex, setImgIndex] = useState(0)
    const width = 320
    const aspectRatio = 9 / 16




    const { data, isLoading: manifestLoading } = useQuery({
        queryKey: ['manifest', iiif, imgIndex],
        queryFn: async () => fetchManifest(iiif, imgIndex, width, aspectRatio)
    })
    const { thumbnailUrl, manifestUuid, manifestType, label } = data || {}

    return <div className="flex flex-col gap-1 relative h-full">
        {manifestLoading ? (
            <div className="w-full aspect-[16/9] bg-neutral-200 animate-pulse border border-neutral-200"></div>
        ) : manifestUuid && (
            <Link
                href={"/iiif/" + manifestUuid}
                className={
                    manifestType === 'Collection'
                        ? "w-full h-full relative border border-neutral-200 flex flex-col items-center justify-center bg-neutral-50 p-2 gap-1 no-underline"
                        : "w-full h-full relative border border-neutral-200 bg-neutral-50 overflow-hidden no-underline"
                }
            >
                {manifestType === 'Collection' ? (
                    <>
                        <PiArchiveThin aria-hidden="true" className="w-16 h-16 md:w-24 md:h-24 text-neutral-800" />
                        <span className="truncate w-full text-center text-neutral-900">
                            {label ? resolveLanguage(label) : ''}
                        </span>
                    </>
                ) : (
                    <img
                        src={thumbnailUrl || "/"}
                        alt={label ? resolveLanguage(label) : 'Dokument'}
                        // Fill width and let height overflow; container clips the bottom.
                        className="block w-full h-auto"
                    />
                )}
            </Link>
        )}

        <div className="flex gap-1 justify-between absolute bottom-1 right-1">
            {Array.isArray(iiif) && iiif.length > 1 && (
                <div className="flex ml-auto">
                    <button
                        onClick={() => setImgIndex(prev => prev > 0 ? prev - 1 : iiif.length - 1)}
                        className="btn btn-outline btn-compact grow md:grow-0"
                        aria-label="Førre bilete"
                    >
                        <PiCaretLeft aria-hidden="true" />
                    </button>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-sm border-neutral-400">
                            {imgIndex + 1}/{iiif.length}
                        </span>
                    </div>
                    <button
                        onClick={() => setImgIndex(prev => prev < iiif.length - 1 ? prev + 1 : 0)}
                        className="btn btn-outline btn-compact grow md:grow-0"
                        aria-label="Neste bilete"
                    >
                        <PiCaretRight aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    </div>
}