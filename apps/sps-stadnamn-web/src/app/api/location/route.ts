import { extractFacets } from "../_utils/facets";
import { postQuery } from "../_utils/post";
import { getQueryString } from "../_utils/query-string";
export async function GET(request: Request) {

    const { termFilters, reservedParams, datasets } = extractFacets(request)
    const coordinates = reservedParams?.point?.split(',')
    if (coordinates.length == 2) {

        const { simple_query_string } = getQueryString(reservedParams, { datasets })


        const query: Record<string, any> = {
            size: 1000,
            _source: false,
            fields: ['uuid', 'label', 'location', 'adm1', 'adm2'],
        }


        const distance_query = {
            geo_distance: {
                distance: '1m',
                location: {
                    lat: parseFloat(coordinates[0]),
                    lon: parseFloat(coordinates[1])
                }
            },

        }

        const exists_filter = {
            exists: {
                field: "location"
            }
        }

        const must_not = reservedParams.doc ? [{
            term: {
                "within.keyword": reservedParams.doc
            }
        }] : undefined

        query.query = {
            bool: {
                must: [distance_query],
                filter: [exists_filter],
                must_not
            }
        }

        if (simple_query_string || termFilters.length) {
            query.query = {
                bool: {
                    must: [distance_query],
                    must_not
                }
            }

            if (simple_query_string) {
                query.query.bool.must.push(simple_query_string)
            }
            if (termFilters.length) {
                query.query.bool.filter = termFilters
            }

        }

        //query.ignore_unmapped = true // Prevent error in datasets without location

        const [data, status] = await postQuery(reservedParams.dataset || 'search', query)
        return Response.json(data, { status: status })
    }

    else {
        return new Response('No coordinates provided', { status: 400 })
    }


}

