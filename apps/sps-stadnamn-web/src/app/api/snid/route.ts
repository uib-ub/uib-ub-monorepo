export const runtime = 'edge'
import { postQuery } from "../_utils/post";
export async function GET(request: Request) {
    const searchParams = new URLSearchParams(new URL(request.url).search);
    const uuid = searchParams.get('uuid');
    
    if (uuid) {
        const query = {
            size: 1,
            query: {
                term: {
                    "children.keyword": uuid
                }
            },
            fields: ['uuid', 'children'],
            _source: false
        }


        const [data, status] = await postQuery('search', query)
        return Response.json(data, { status: status })
    }
    else {
        return Response.json({error: 'INVALID_QUERY'}, { status: 400 });
    }
  
}