export const runtime = 'edge'
import { treeSettings } from "@/config/server-config";
import { postQuery } from "../_utils/post";


export async function GET(request: Request) {
    // get params dataset and groupBy, and adm1 and adm2 if they exist
    const searchParams = new URL(request.url).searchParams;
    const { dataset, adm, groupBy } = Object.fromEntries(searchParams.entries())
    console.log("ADM", adm)
    const [adm1, adm2] = adm?.split('__').reverse() || [null, null]
    console.log(adm1, adm2)
    
    
    const query = {
        size: groupBy ? 0 : 500,
        ...!groupBy && { sort: treeSettings[dataset].sort.map(field => field.includes("__") ? {[field.replace("__", ".")]: {nested: {path: field.split("__")[0]}}} : field) },
        query: {
            bool: {
                must: [
                    { match: treeSettings[dataset].filter || { sosi: 'gard' } }
                ],
                filter: [
                    ...(adm1 ? [{ term: { "adm1.keyword": adm1 } }] : []),
                    ...(adm2 ? [{ term: { "adm2.keyword": adm2 } }] : []),
                ]
            }
        },
        fields: [
            "label", "uuid", "location", treeSettings[dataset].subunit.replace("__", "."),

            ...(adm1 ? ["adm1"] : []),
            ...(adm2 ? ["adm2"] : []),
        ],
        ...groupBy ? {
            aggs: {
                [groupBy]: {
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
            }
        } : {},
        _source: false
        
    }



    
    const [data, status] = await postQuery(dataset, query)

    return Response.json(data, { status: status })
}

