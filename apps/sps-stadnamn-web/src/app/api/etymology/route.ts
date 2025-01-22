export const runtime = 'edge'
import { resultConfig } from "@/config/search-config";
import { postQuery } from "../_utils/post";

export async function POST(request: Request) {
    const body = await request.json();
    let uuids = body.uuids;

    if (!uuids || !Array.isArray(uuids) || uuids.length === 0) {
        console.error("No uuids provided or uuids array is empty");
        return Response.json({ error: "No uuids provided" }, { status: 400 });
    }

    // Log the uuids array to check its structure
    console.log("UUIDs received:", uuids);

    // Flatten the uuids array if necessary
    if (Array.isArray(uuids[0])) {
        uuids = uuids.flat();
        console.log("Flattened UUIDs:", uuids);
    }

    const query = {
        size: 10,
        fields: ["uuid", "content.html"],
        query: {
            terms: {
                "uuid": uuids
            }
        },
    };

    console.log("Query being sent:", JSON.stringify(query, null, 2));

    const [data, status] = await postQuery(body.etymologyDataset, query);

    if (!data) {
        console.error("No data returned from postQuery");
    } else {
        console.log("Data received:", data);
    }

    return Response.json(data, { status: status });
}