import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

async function getIIIFMapLinks(iiif: string | undefined) {
    if (!iiif) {
        return { hits: { hits: [] } };
    }
    const response = await fetch(`/api/iiif/map-links?iiif=${iiif}`);
    return response.json();
}



import { useParams } from "next/navigation";
import { PiMapPin } from "react-icons/pi";

export default function IIIFMapLinks() {
    const params = useParams();
    // `params.slug` is expected to be an array, grab the first entry as the iiif id
    const iiif = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

    const { data } = useQuery({
        queryKey: ['iiif-map-links', iiif],
        queryFn: () => getIIIFMapLinks(iiif),
    });

    if (!data?.hits?.hits?.length) {
        return null;
    }

    return <aside>
        <h2>Oppslag i stadnamnsøket</h2>
        {data?.hits?.hits?.map((hit: any) => (
            <div key={hit._id}>
                <Link className="flex items-center gap-1" href={`/uuid/${hit.fields.uuid[0]}`}>{hit.fields?.location && <PiMapPin aria-hidden="true" />} {hit.fields.label[0]}</Link>
            </div>
        ))}
    </aside>
}