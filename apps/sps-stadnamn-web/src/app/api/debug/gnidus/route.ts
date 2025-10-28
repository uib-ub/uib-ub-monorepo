import { postQuery } from "../../_utils/post"

export async function POST(request: Request) {

    const { gnidus } = await request.json()

    console.log("FETCHING GNIDU DATA FOR", gnidus);

    const query: Record<string, any> = {
        "size": 1000,
        "track_scores": false,
        "_source": true,
        "query": {
            "terms": {
                "gnidu": gnidus
            }
        }
    }

    console.log("QUERY", query);

    const [data, status] = await postQuery('core_gnidu', query)
    return Response.json(data, { status: status })
}