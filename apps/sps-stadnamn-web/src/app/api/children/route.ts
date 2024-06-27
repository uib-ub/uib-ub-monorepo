export const runtime = 'edge'
import { postQuery } from "../_utils/fetch";
export async function GET(request: Request) {

    // Extract uuids from comma separated parameter in request
    const snid = new URLSearchParams(new URL(request.url).search).get('parent');
    let uuids = new URLSearchParams(new URL(request.url).search).get('children')?.split(',');

    // If the list of children is too long to be passed as a query parameter
    if (!uuids) {
        const children_query = {
            size: 1000,
            query: {
                term: {
                    "uuid": snid
                }
            },
            _source: ["children"]
        }

        const snid_data = await postQuery("search", children_query)

        if (!snid_data.hits.hits) {
            console.log("No hits", snid_data)
            return Response.json([])
        }

        uuids = snid_data.hits.hits[0]._source.children

    }

    // Fetch only the "children" field from the snid document   
    const query = {
        size: 1000,
        query: {
            terms: {
                "uuid": uuids
            },
        }
    }



    const data = await postQuery("*", query)

    return Response.json(data.hits.hits)
  }