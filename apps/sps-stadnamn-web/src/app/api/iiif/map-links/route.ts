import { postQuery } from "../../_utils/post";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const iiif = url.searchParams.get('iiif');

    const query: Record<string, any> = {
        size: 100,
        _source: false,
        track_scores: false,
        fields: ['uuid', 'label', 'location'],
        query: {
            term: {
                "iiif.keyword": iiif
            }
        }
    }
    const [data, status] = await postQuery('all', query);
    return Response.json(data, { status });
}

