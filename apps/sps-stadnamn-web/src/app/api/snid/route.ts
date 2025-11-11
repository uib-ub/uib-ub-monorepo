//export const runtime = 'edge'
import { postQuery } from "../_utils/post";
export async function GET(request: Request) {
    const searchParams = new URLSearchParams(new URL(request.url).search);
    const uuid = searchParams.get('uuid');
    const snid = searchParams.get('snid');
    
    if (uuid) {
        // Find parent SNID when given child UUID
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
    else if (snid) {
        // Find UUID when given SNID
        const query = {
            size: 1,
            query: {
                term: {
                    "snid.keyword": snid
                }
            },
            fields: ['uuid'],
            _source: false
        }

        const [data, status] = await postQuery('search', query)
        return Response.json(data, { status: status })
    }
    else {
        return Response.json({error: 'INVALID_QUERY'}, { status: 400 });
    }
  
}