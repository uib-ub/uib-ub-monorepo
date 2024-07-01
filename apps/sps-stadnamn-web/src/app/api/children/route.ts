export const runtime = 'edge'
import { postQuery } from "../_utils/fetch";
export async function GET(request: Request) {

    // Extract uuids from comma separated parameter in request
    const snid = new URLSearchParams(new URL(request.url).search).get('snid');
    const uuid = new URLSearchParams(new URL(request.url).search).get('uuid');
    let uuids = new URLSearchParams(new URL(request.url).search).get('uuids')?.split(',');

    if (snid) {
        const query = {
            size: 1000,
            query: {
                term: {
                    "snid.keyword": snid
                }
            }
        }

        const data = await postQuery(`*,-stadnamn-${process.env.SN_ENV}-search`, query)
        return Response.json(data?.hits?.hits || data)

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

        const data = await postQuery("search", query)

        if (!data.hits.hits) {
            return Response.json([])
        }

        uuids = data.hits.hits[0]._source.children

    }
 
    const query = {
        size: 1000,
        query: {
            terms: {
                "uuid": uuids
            }
        }
    }


    const data = await postQuery(`*,-stadnamn-${process.env.SN_ENV}-search`, query)

    return Response.json(data.hits.hits)
  }