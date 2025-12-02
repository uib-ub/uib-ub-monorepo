import Image from "next/image";

export default async function Thumbnail({ manifestId, dataset }: { manifestId: string, dataset: string }) {
    const height = 240


    async function fetchThumbnail() {
        'use server'
        const url = `https://iiif.test.ubbe.no/iiif/manifest${dataset === 'nbas' ? '/stadnamn/NBAS' : ''}/${manifestId}.json`
        const res = await fetch(url);
        const data = res.ok ? await res.json() : null
        const [, originalWidth, originalHeight] = data?.thumbnail?.[0]?.id.match(/\/full\/(\d+),(\d+)\//) || []
        console.log("ORIGINAL", originalWidth, originalHeight)
        const newWidth = originalWidth ? Math.round((parseInt(originalWidth, 10) * height) / parseInt(originalHeight, 10)) : null
        const baseUrl = data?.thumbnail?.[0]?.id.split('/full/')[0]

        console.log("ID", JSON.stringify(data?.thumbnail, null, 2))
        const newThumbnailUrl = `${baseUrl}/full/${newWidth},${height}/0/default.jpg`
        console.log("NEW", newThumbnailUrl)


        return { thumbnail: newThumbnailUrl, width: newWidth }

    }


    const { thumbnail, width } = await fetchThumbnail()

    return width ? (
        <Image width={width} height={height} src={thumbnail} alt="Seddel" />
    ) : "NO WIDTH"
}