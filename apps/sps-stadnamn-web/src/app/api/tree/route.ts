export const runtime = 'edge'
import { treeSettings } from "@/config/server-config";
import { postQuery } from "../_utils/post";


export async function GET(request: Request) {
    // get params dataset and groupBy, and adm1 and adm2 if they exist
    const searchParams = new URL(request.url).searchParams;
    const { dataset, adm } = Object.fromEntries(searchParams.entries())
    const [adm1, adm2] = adm?.split("__") || [];
    console.log("ADM1 and 2", adm1, adm2)
    const groupBy = adm1 ? 'adm2' : 'adm1';
    
    const query = {
        size: 0,
        query: {
            bool: {
                must: [
                    { match: treeSettings[dataset].filter || { sosi: 'gard' } }
                ],
                filter: [
                    ...(adm1 ? [{ term: { "adm1.keyword": adm1 } }] : []),
                    ...(adm2 ? [{ term: { "adm2.keyword": adm2 } }] : [])
                ]
            }
        },
        fields: ["label", "uuid", "location"],
        aggs: {
            adm: {
                terms: {
                    field: groupBy + ".keyword",
                    size: 100,
                },
                ...treeSettings[dataset].aggSort && {
                    aggs: {
                        aggNum: {
                            terms: {
                                field: treeSettings[dataset].aggSort,
                                size: 1,
                            }
                        }
                    }

                }
            }
        },
        _source: false
    };

    
    const [data, status] = await postQuery(dataset, query)

    return Response.json(data, { status: status })
}

