export const runtime = 'edge'
import { fetchIIIFNeighbours } from '../_utils/actions';

export async function GET(request: Request) {
    // Get uuid and partOf from params
    const { searchParams } = new URL(request.url)
    const order = parseInt(searchParams.get('order') || '0')
    const partOf = searchParams.get('partOf')
    if (!order) {
        return Response.json({ error: 'order is required' }, { status: 400 })
    }
    if (!partOf) {
        return Response.json({ error: 'partOf is required' }, { status: 400 })
    }
    const data = await fetchIIIFNeighbours(order, partOf);

  return Response.json(data);
}