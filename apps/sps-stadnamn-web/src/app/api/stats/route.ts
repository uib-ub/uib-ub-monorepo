//export const runtime = 'edge'
import { fetchStats } from '../_utils/stats';

export async function GET() {

    const { groupCount, datasets, subdatasets, iiifStats } = await fetchStats()


    return Response.json({groupCount, datasets, subdatasets, iiifStats})
}