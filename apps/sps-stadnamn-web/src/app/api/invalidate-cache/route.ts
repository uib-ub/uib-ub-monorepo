import { revalidateTag } from "next/cache";

export async function GET(request: Request) {
    revalidateTag('all')
    return new Response('Cache invalidated', { status: 200 })

}