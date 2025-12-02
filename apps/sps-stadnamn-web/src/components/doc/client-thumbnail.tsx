'use client'
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useState } from "react"
import { PiCaretLeft, PiCaretRight } from "react-icons/pi"


async function fetchManifest(iiif: string | string[], imgIndex: number, width: number, aspectRatio: number) {
    let response: Response
    if (Array.isArray(iiif)) {
        response = await fetch(`api/doc?uuid=${iiif[imgIndex]}&dataset=iiif_*`)
    } else {
        response = await fetch(`api/doc?uuid=${iiif}&dataset=iiif_*`)
    }
    const data = await response.json()

    const dataset = data.hits.hits[0]._index.split("-")[2].split("_")[1]
    const outputWidth = width * 2
    const outputHeight = Math.round(outputWidth * (9 / 16))
    const thumbnailUrl = `https://iiif.spraksamlingane.no/iiif/image/stadnamn/${dataset.toUpperCase()}/${data.hits.hits[0]._source.images[0].uuid}/0,0,${data.hits.hits[0]._source.images[0].width},${Math.round(data.hits.hits[0]._source.images[0].width * aspectRatio)}/${outputWidth},${outputHeight}/0/default.jpg`
    return {
        thumbnailUrl,
        manifestUuid: data.hits.hits[0]._source.uuid,
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
    const { thumbnailUrl, manifestUuid } = data || {}


    return <div className="flex flex-col gap-1 relative">
        {manifestLoading ? (
            <div className="w-full aspect-[16/9] bg-neutral-200 animate-pulse border border-neutral-200"></div>
        ) : (
            <Link href={"/iiif/" + manifestUuid} className="w-full aspect-[16/9] relative block border border-neutral-200">
                <img
                    src={thumbnailUrl || "/"}
                    alt="Seddel"
                    className="object-contain"

                />
            </Link>
        )}

        <div className="flex gap-1 justify-between absolute bottom-1 right-1">
            {Array.isArray(iiif) && iiif.length > 1 && (
                <div className="flex ml-auto">
                    <button
                        onClick={() => setImgIndex(prev => prev > 0 ? prev - 1 : iiif.length - 1)}
                        className="btn btn-outline btn-compact grow md:grow-0"
                        aria-label="Forrige bilde"
                    >
                        <PiCaretLeft />
                    </button>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-sm border-neutral-400">
                            {imgIndex + 1}/{iiif.length}
                        </span>
                    </div>
                    <button
                        onClick={() => setImgIndex(prev => prev < iiif.length - 1 ? prev + 1 : 0)}
                        className="btn btn-outline btn-compact grow md:grow-0"
                        aria-label="Neste bilde"
                    >
                        <PiCaretRight />
                    </button>
                </div>
            )}
        </div>
    </div>
}