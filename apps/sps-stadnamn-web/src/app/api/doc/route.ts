//export const runtime = 'edge'
import { postQuery } from "../_utils/post";

export async function GET(request: Request) {
    const searchParams = new URLSearchParams(new URL(request.url).search);
    const dataset = searchParams.get('dataset') || '*';
    const uuid = searchParams.get('uuid');
    
    if (uuid) {
        // First attempt: search only by exact UUID
        const initialQuery = {
            size: 1,
            terminate_after: 1,
            track_scores: false,
            query: {
                term: { uuid: uuid }
            }
        };

        const [initialData, initialStatus] = await postQuery(dataset, initialQuery);
                
        // If we found a result, return it
        if (initialData?.hits?.total?.value > 0) {
            return Response.json(initialData, { status: initialStatus });
        }

        // Second attempt: include redirects
        const redirectQuery = {
            size: 1,
            terminate_after: 1,
            track_scores: false,
            query: {
                term: { redirects: uuid }
            }
        };

        const [redirectData, redirectStatus] = await postQuery(dataset, redirectQuery, undefined, true);
        return Response.json(redirectData, { status: redirectStatus });
    }
    else {
        return Response.json({error: 'INVALID_QUERY'}, { status: 400 });
    }
}

