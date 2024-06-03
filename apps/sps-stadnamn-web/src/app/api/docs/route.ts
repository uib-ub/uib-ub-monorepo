export const runtime = 'edge'
import { postQuery } from "../_utils/fetch";
export async function GET(request: Request) {
    const docs = new URLSearchParams(new URL(request.url).search).get('docs');
    let dataset = new URLSearchParams(new URL(request.url).search).get('dataset');
    if (!dataset || dataset == 'search') {
      dataset = '*'
    }


    if (!docs || !dataset) {
        return new Response('Missing parameter', { status: 400 });
      }
    const query = {
        query: {
            terms: {
                "_id": docs.split(',')
            }
        }
    }

    const data = await postQuery(dataset, query)

  return Response.json(data);
}