import Image from "next/image"

export default async function Thumbnail({ manifestId, dataset }: { manifestId: string, dataset: string}) {

    async function fetchThumbnail() {
        'use server'
        // TODO: create api route that generates manifest from elasticsearch index  
        const res = await fetch(`https://iiif.test.ubbe.no/iiif/manifest/${dataset === 'nbas' ? 'stadnamn/NBAS' : ''}/${manifestId}.json`);
        const data = res.ok ? await res.json() : null
        const height = 128

        const [, originalWidth, originalHeight] = data?.thumbnail?.[0]?.id.match(/\/full\/(\d+),(\d+)\//) || []
            const newWidth = originalWidth ? Math.round((parseInt(originalWidth, 10) * height) / parseInt(originalHeight, 10)) : null
            const baseUrl = data?.thumbnail?.[0]?.id.split('/full/')[0]
            const newThumbnailUrl = `${baseUrl}/full/${newWidth},${height}/0/default.jpg`
            


        return {thumbnail: newThumbnailUrl, width: newWidth, height: height}
    
    }


    const {thumbnail, width, height} = await fetchThumbnail()

    return width ? (
        <Image width={width} height={height} src={thumbnail} alt="Seddel" />
    ) : null
}