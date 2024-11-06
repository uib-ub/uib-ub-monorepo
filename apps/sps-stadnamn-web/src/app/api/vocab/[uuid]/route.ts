export const runtime = 'edge'
import { fetchDoc } from '../../_utils/actions';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const uuid = url.pathname.split('/')[3];
    const data = await fetchDoc({ uuid, dataset: 'vocab' });

  return Response.json(data);
}