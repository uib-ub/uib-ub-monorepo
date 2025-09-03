import { fetchIIIFStats } from '../../_utils/stats';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const manifestUuid = searchParams.get('manifestUuid');
    
    try {
        // If no manifestUuid provided, fetch overall IIIF stats (pass undefined)
        const stats = await fetchIIIFStats(manifestUuid || undefined);
        return Response.json(stats);
    } catch (error) {
        return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
