export const runtime = 'edge'
import { fetchChildren } from "../_utils/actions"

export async function POST(request: Request) {
    const body = await request.json()
    const [data, status] = await fetchChildren({
        uuids: body.children,
        mode: body.mode,
        within: body.within,
        dataset: body.dataset
    })

    return Response.json(data, { status: status })
}