export const runtime = 'edge'
import { fetchDoc } from '../../_utils/actions';

export async function GET(request: Request) {
  console.log("REQUEST", request)
    const url = new URL(request.url);
    const uuid = url.pathname.split('/')[3];
    console.log("UUID", uuid)
    console.log("PATHNAME", url.pathname)
    //const data = await fetchDoc({ uuid, dataset: 'vocab' });

  return Response.json({hello: "world"});
}