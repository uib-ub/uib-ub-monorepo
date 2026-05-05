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
import { PiMapPin, PiMapPinFill } from "react-icons/pi";

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

    return <aside className="bg-neutral-50 shadow-md !text-neutral-950 p-4 rounded-md">
        <h2 className="!text-2xl !p-0 !m-0">Oppslag i stadnamnsøket</h2>
        <ul className="list-none !px-0 !mx-0 ">
        {data?.hits?.hits?.map((hit: any) => (
                <li key={hit._id} className="list-none"><Link className="flex gap-4 pt-2 no-underline items-center text-xl" href={`/uuid/${hit.fields.uuid[0]}`}>{hit.fields?.location && <PiMapPinFill aria-hidden="true" className="text-primary-700 text-2xl"/>} {hit.fields.label[0]}</Link></li>
        ))}
        </ul>
    </aside>
}