import { contentSettings } from "@/config/server-config";
import { postQuery } from "../_utils/post";

export const runtime = 'edge'

export async function GET(request: Request) {
    // get params dataset and groupBy, and adm1 and adm2 if they exist
    const searchParams = new URL(request.url).searchParams;
    const { dataset, adm1, adm2 } = Object.fromEntries(searchParams.entries())
    const groupBy = adm2 ? undefined : adm1 ? 'adm2' : 'adm1'
    
    const query = {
        size: groupBy ? 0 : 1000,
        query: {

            bool: {
                must: [
                    { match: contentSettings[dataset].tree?.filter || { sosi: 'gard' } }
                ],
                filter: [
                    ...(adm1 ? [{ term: { "adm1.keyword": adm1 } }] : []),
                    ...(adm2 ? [{ term: { "adm2.keyword": adm2 } }] : [])
                ]
            }
        },
        fields: ["label", "uuid", (contentSettings[dataset].tree?.subunit || "cadastre.gnr"), "location"],
        ...groupBy ? {
            aggs: {
                adm: {
                    terms: {
                        field: groupBy + ".keyword",
                        size: 500,
                    },
                    aggs: {
                        knr: {
                            terms: {
                                field: contentSettings[dataset].tree?.knr || "knr.keyword",
                                size: 1,
                            }
                        }

                    }
                }
            }
        } : {
            sort: contentSettings[dataset].tree?.sort ? 
                contentSettings[dataset].tree?.sort?.map((field: string) => {
                    return {[field]: {order: "asc"}}
                })
                : [{ "cadastre.gnr": { order: "asc", nested: { path: "cadastre" } } }]

            
        },
        _source: false
    };

    //console.log("QUERY", query)
        
    
  const response = await postQuery(dataset, query)
    

  return Response.json(response)
}

