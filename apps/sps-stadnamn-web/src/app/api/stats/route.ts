export const runtime = 'edge'
import { fetchStats } from '../_utils/actions';

export async function GET() {

    const data = await fetchStats();

  return Response.json(data);
}