//export const runtime = 'edge'
import { treeSettings } from "@/config/server-config";
import { postQuery } from "../_utils/post";


export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams;
    const { dataset, adm1, adm2 } = Object.fromEntries(searchParams.entries())
    
    const query = {
        size: 10000,
        track_scores: false,
        query: {
            bool: {
                must: [
                    { exists: { field: "within" } },
                    ...(adm1 ? [{ term: { "adm1.keyword": adm1 } }] : []),
                    ...(adm2 ? [{ term: { "adm2.keyword": adm2 } }] : [])
                ]
            }
        },
        sort: adm2 ? 
            treeSettings[dataset].sort.map(field => {
                const [parent, child] = field.split("__");
                // If the field contains __, it's nested
                if (child) {
                    return {
                        [`${parent}.${child}`]: {
                            order: "asc",
                            nested: {
                                path: parent
                            }
                        }
                    };
                }
                // If not nested, use simple sort
                return {
                    [field]: { order: "asc" }
                };
            }) : 
            [{
                [treeSettings[dataset].aggSort]: { order: "asc" }
            }],
        fields: ["adm1", "adm2", treeSettings[dataset].parentName, "within", treeSettings[dataset].subunit.replace("__", "."), treeSettings[dataset].aggSort],
        collapse: {
            field: adm2 ? "within.keyword" : "adm2.keyword"
        },
        _source: false
    }

    const [data, status] = await postQuery(dataset, query)

    return Response.json(data, { status: status })
}


