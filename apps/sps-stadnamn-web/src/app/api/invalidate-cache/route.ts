import { revalidateTag } from "next/cache";

export async function GET(request: Request) {
    // Check for API token in Authorization header
    // Only require auth in production (not in preview or development)
    if (process.env.VERCEL_ENV === 'production') {
        const authHeader = request.headers.get('authorization');
        const expectedToken = process.env.STADNAMN_CACHE_TOKEN;

        if (!expectedToken) {
            return new Response('Access denied', { status: 403 });
        }

        if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
            return new Response('Unauthorized', { status: 401 });
        }
    }

    revalidateTag('all', 'max')
    return new Response('Cache invalidated', { status: 200 })
}