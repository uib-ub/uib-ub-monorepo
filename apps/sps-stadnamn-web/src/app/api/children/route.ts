export const runtime = 'edge'
import { postQuery } from "../_utils/post";
export async function GET(request: Request) {

    // Extract uuids from comma separated parameter in request
    const searchParams = new URLSearchParams(new URL(request.url).search)
    const snid = searchParams.get('snid');
    const uuid = searchParams.get('uuid');
    let uuids = searchParams.get('uuids')?.split(',');
    const geo = searchParams.get('geo') &&  {
                                                aggs: {
                                                    viewport: {
                                                        geo_bounds: {
                                                            field: "location",
                                                            wrap_longitude: true
                                                        }
                                                    }
                                                }
                                            }



    if (snid) {
        const query = {
            size: 1000,
            query: {
                term: {
                    "snid.keyword": snid
                }
            },
            ...geo || {}
        }


        const [data, status] = await postQuery(`*,-search-stadnamn-${process.env.SN_ENV}-search`, query)
        return Response.json(data, { status: status })

    }

    // If the list of children is too long to be passed as a query parameter
    if (!uuids) {
        const query = {
            query: {
                term: {
                    "uuid": uuid
                }
            },
            _source: ["children"]
        }

        const [data, status] = await postQuery("search", query)

        if (!data.hits.hits) {
            return Response.json([], { status: 404 })
        }

        uuids = data.hits.hits[0]._source.children

    }
 
    const query = {
        size: 1000,
        query: {
            terms: {
                "uuid": uuids
            }
        },
        ...geo || {}
    }


    const [data, status] = await postQuery(`*,-search-stadnamn-${process.env.SN_ENV}-search`, query)

    return Response.json(data, { status: status })
  }