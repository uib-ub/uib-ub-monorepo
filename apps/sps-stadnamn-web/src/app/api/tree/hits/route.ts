import { treeSettings } from "@/config/server-config";
import { postQuery } from "../../_utils/post";

export const runtime = 'edge'

export async function GET(request: Request) {
    // get params dataset and groupBy, and adm1 and adm2 if they exist
    const searchParams = new URL(request.url).searchParams;
    const { dataset, adm1, adm2 } = Object.fromEntries(searchParams.entries())
    const path = treeSettings[dataset].sort[0]?.split("__") 
    const nestedPath = path.length == 2 && path?.[0]
    const subunit = nestedPath ? path?.[1] : path[0]

    console.log("nested", nestedPath)
    console.log("subunit", subunit)
    
    const query = {
        size: 10, // TODO: add pagination
        query: {

            bool: {
                must: [
                    { match: treeSettings[dataset].filter || { sosi: 'gard' } },
                    
                ],
                filter: [
                    ...(adm1 ? [{ term: { "adm1.keyword": adm1 } }] : []),
                    ...(adm2 ? [{ term: { "adm2.keyword": adm2 } }] : [])
                ]
            }
        },
        fields: ["label", "uuid", treeSettings[dataset].subunit?.replace(".keyword", "").replace("__", ".") || 'cadastre.gnr', "location"],
        sort: treeSettings[dataset].sort.map((field: string) => {
                if (nestedPath) {
                    return {[field.replace("__", ".")]: {order: "asc", nested: {path: nestedPath}}}
                }
                return {[field]: {order: "asc"}}
            }),
        _source: false
    };

    
    const response = await postQuery(dataset, query)
    console.log("QUERY", query)
    console.log("RESPONSE", response)
    

    return Response.json(response)
}

