import { DocContext } from "@/app/doc-provider"
import { datasetTitles } from "@/config/metadata-config"
import { useDataset } from "@/lib/search-params"
import Image from "next/image"
import Link from "next/link"
import { useContext, useEffect, useState } from "react"
import { PiCaretLeft, PiCaretRight } from "react-icons/pi"

export default function ClientThumbnail({ images }: { images: {manifest: string, dataset: string}[] }) {
    const [imgIndex, setImgIndex] = useState(0)
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
    const [width, setWidth] = useState<number | null>(null)
    const height = 240
    const dataset = useDataset()
    const { docDataset } = useContext(DocContext)

    useEffect(() => {
        const manifest = images[imgIndex].manifest
        const imgDataset = images[imgIndex].dataset
        const fetchThumbnail = async (url: string) => {
            console.log(url)
            const response = await fetch(url)
            const data = await response.json()
            const [, originalWidth, originalHeight] = data?.thumbnail?.[0]?.id.match(/\/full\/(\d+),(\d+)\//) || []
            const newWidth = originalWidth ? Math.round((parseInt(originalWidth, 10) * height) / parseInt(originalHeight, 10)) : null
            const baseUrl = data?.thumbnail?.[0]?.id.split('/full/')[0]
            const newThumbnailUrl = `${baseUrl}/full/${newWidth},${height}/0/default.jpg`
            setWidth(newWidth)
            setThumbnailUrl(newThumbnailUrl)
        }

        fetchThumbnail(`https://iiif.test.ubbe.no/iiif/manifest${imgDataset == 'nbas' ? '/stadnamn/NBAS' : ''}/${manifest}.json`)
    }, [imgIndex, height])

    return <div className="flex flex-col gap-1">
        
        {thumbnailUrl && width && height && <Link href={"/iiif/" + images[imgIndex].manifest}><Image width={width} height={height} src={thumbnailUrl} alt="Seddel" /></Link>}
        {dataset == 'search' && docDataset != images[imgIndex].dataset && <span className="text-sm text-neutral-700 self-center">Kjelde: {datasetTitles[images[imgIndex].dataset]}</span>}
        {images.length > 1 && (
          <div className="flex self-center">
              <button 
                onClick={() => setImgIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                className="btn btn-outline btn-compact grow md:grow-0"
                aria-label="Forrige bilde"
              >
                <PiCaretLeft />
              </button>
              <div className="flex gap-2">
              <span className="px-3 py-1 rounded-sm border-neutral-400">
                {imgIndex + 1}/{images.length}
              </span>
              </div>
              <button
                onClick={() => setImgIndex(prev => prev < images.length - 1 ? prev + 1 : 0)} 
                className="btn btn-outline btn-compact grow md:grow-0"
                aria-label="Neste bilde"
              >
                <PiCaretRight />
              </button>

          </div>
        )}
    </div>
}