import { revalidatePath, revalidateTag } from "next/cache";

export async function GET(request: Request) {
    // Check for API token in Authorization header
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.STADNAMN_CACHE_TOKEN;
    console.log(expectedToken)
    
    if (!expectedToken) {
        return new Response('Access denied', { status: 403 });
    }
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
        return new Response('Unauthorized', { status: 401 });
    }
    
    revalidateTag('all')
    return new Response('Cache invalidated', { status: 200 })
}