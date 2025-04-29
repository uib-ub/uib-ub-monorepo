import { DocContext } from "@/app/doc-provider"
import { datasetTitles } from "@/config/metadata-config"
import { useDataset } from "@/lib/search-params"
import Image from "next/image"
import Link from "next/link"
import { useContext, useEffect, useState } from "react"
import { PiCaretLeft, PiCaretRight, PiDatabaseFill, PiFiles, PiFilesFill } from "react-icons/pi"

export default function ClientThumbnail({ iiif }: { iiif: string | string[]  }) {
    const [imgIndex, setImgIndex] = useState(0)
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
    const height = 240
    const width = 320
    const aspectRatio = height / width
    const dataset = useDataset()
    const { docDataset } = useContext(DocContext)

    const [manifest, setManifest] = useState<string | null>(null)
    const [manifestUuid, setManifestUuid] = useState<string | null>(null)
    const [manifestDataset, setManifestDataset] = useState<string | null>(null)
    const [manifestLoading, setManifestLoading] = useState(true)

    useEffect(() => {
        const fetchManifest= async (url: string) => {
            const response = await fetch(url)
            const data = await response.json()
            console.log("DATA", data)
            const source = data?.hits?.hits?.[0]?._source
            setManifest(source)
            setManifestUuid(source.uuid)
            const dataset = data?.hits?.hits?.[0]?._index.split("-")[2].split("_")[1]
            setManifestDataset(dataset)
            setThumbnailUrl(`https://iiif.test.ubbe.no/iiif/image/stadnamn/${dataset.toUpperCase()}/${source.images[0].uuid}/0,0,${source.images[0].width},${Math.round(source.images[0].width*aspectRatio)}/${width*2},${height*2}/0/default.jpg`)
            setManifestLoading(false)
        }


        if (Array.isArray(iiif)) {
            fetchManifest(`api/doc?uuid=${iiif[imgIndex]}&dataset=iiif_*`)
        } else {
            fetchManifest(`api/doc?uuid=${iiif}&dataset=iiif_*`)
        }
    }, [iiif, imgIndex, aspectRatio])

    return <div className="flex flex-col gap-1">
        {manifestLoading ? (
            <div className="w-full aspect-[16/9] bg-neutral-200 animate-pulse border border-neutral-200"></div>
        ) : (
            <Link href={"/iiif/" + manifestUuid} className="w-full aspect-[16/9] relative block border border-neutral-200">
                <Image
                    src={thumbnailUrl || "/"} 
                    alt="Seddel"
                    className="object-cover"
                    fill
                    />
            </Link>
        )}
        
        <div className="flex gap-1 justify-between">
            {manifestDataset && dataset == 'search' && docDataset != manifestDataset && (
                <span className="flex items-center gap-2 text-neutral-800 min-w-0">
                    <span className="truncate">{datasetTitles[manifestDataset]}</span>
                </span>
            )}
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