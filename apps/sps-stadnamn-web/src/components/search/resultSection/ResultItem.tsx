import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers-map-search';
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsInteger, parseAsString, useQueryState } from "nuqs";



export default function ResultItem({hit, setSelectedDoc, debugIndex}: {hit: any, setSelectedDoc: any, debugIndex?: number}) {
    const searchParams = useSearchParams()
    const serialize = createSerializer({
        doc: parseAsString,
        center: parseAsArrayOf(parseAsFloat, ','),
    });

    const params = useParams<{uuid: string; dataset: string}>()
    const titleRenderer = resultRenderers[params.dataset]?.title || defaultResultRenderer.title
    const detailsRenderer = resultRenderers[params.dataset]?.details || defaultResultRenderer.details


    return  <li className="flex flex-grow">
            <Link onClick={() => setSelectedDoc(hit)}
                className="w-full h-full py-2 px-2 hover:bg-neutral-50 no-underline" 
                href={serialize(new URLSearchParams(searchParams), {doc: hit.fields.uuid, ...hit.fields.location?.[0].type == 'Point' ? {center: hit.fields.location[0].coordinates.toReversed()} : {}})}>
            <strong className="text-neutral-950">{titleRenderer(hit, 'map')}</strong>
            <p>
            { detailsRenderer(hit, 'map') }
            </p>
            </Link>
            </li>
}

