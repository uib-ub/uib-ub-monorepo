import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resultRenderers, defaultResultRenderer } from '@/config/result-renderers-map-search';
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsString } from "nuqs";
import { useDataset } from '@/lib/search-params';



export default function ResultItem({hit}: {hit: any}) {
    const searchParams = useSearchParams()
    const dataset = useDataset()
    const serialize = createSerializer({
        doc: parseAsString,
        center: parseAsArrayOf(parseAsFloat, ','),
        point: parseAsArrayOf(parseAsFloat, ','),
    });

    const titleRenderer = resultRenderers[dataset]?.title || defaultResultRenderer.title
    const detailsRenderer = resultRenderers[dataset]?.details || defaultResultRenderer.details
    const snippetRenderer = resultRenderers[dataset]?.snippet


    return  <li className="flex flex-grow">
            <Link className="w-full h-full py-2 px-2 md:px-4 hover:bg-neutral-50 no-underline" 
                  href={serialize(new URLSearchParams(searchParams), {doc: hit.fields.uuid, point: null, ...hit.fields.location?.[0].type == 'Point' ? {center: hit.fields.location[0].coordinates.toReversed()} : {}})}>
            <strong className="text-neutral-950">{titleRenderer(hit, 'map')}</strong>
            
            {hit.highlight && snippetRenderer ? <> | {detailsRenderer(hit, 'map')} {snippetRenderer(hit, 'map')}  </>
            : <p>
            { detailsRenderer(hit, 'map') }
            </p>}

            </Link>
            </li>
}

