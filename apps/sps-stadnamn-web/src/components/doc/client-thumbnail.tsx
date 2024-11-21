import Image from "next/image"
import { useEffect, useState } from "react"

export default function ClientThumbnail({ manifestId }: { manifestId: string }) {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
    const [width, setWidth] = useState<number | null>(null)
    const height = 240

    useEffect(() => {
        const fetchThumbnail = async (url: string) => {
            const response = await fetch(url)
            const data = await response.json()
            const [, originalWidth, originalHeight] = data?.thumbnail?.[0]?.id.match(/\/full\/(\d+),(\d+)\//) || []
            const newWidth = originalWidth ? Math.round((parseInt(originalWidth, 10) * height) / parseInt(originalHeight, 10)) : null
            const baseUrl = data?.thumbnail?.[0]?.id.split('/full/')[0]
            const newThumbnailUrl = `${baseUrl}/full/${newWidth},${height}/0/default.jpg`
            setWidth(newWidth)
            setThumbnailUrl(newThumbnailUrl)
        }

        fetchThumbnail(`https://iiif.test.ubbe.no/iiif/manifest/${manifestId}.json`).catch(() => {
            fetchThumbnail(`https://iiif.test.ubbe.no/iiif/manifest/stadnamn/NBAS/${manifestId}.json`)
        })
    }, [manifestId, height])

    return thumbnailUrl && width && height && <Image width={width} height={height} src={thumbnailUrl} alt="Seddel" />
}