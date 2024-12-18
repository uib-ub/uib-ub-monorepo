export const runtime = 'edge'
import { resultConfig } from "@/config/search-config";
import { postQuery } from "../_utils/post";
export async function POST(request: Request) {
    const body = await request.json()
    const uuids = body.children
    if (!uuids) {
        return Response.json({error: "No uuids provided"}, { status: 400 })
    }

    const geo = body.mode == 'map' &&  {
                                        aggs: {
                                            viewport: {
                                                geo_bounds: {
                                                    field: "location",
                                                    wrap_longitude: true
                                                }
                                            }
                                        }
                                    }

    const allFields = [...new Set(Object.values(resultConfig).flat())]
 
    const query = {
        size: 1000,
        fields: allFields,
        query: {
            terms: {
                "uuid": uuids
            }
        },
        ...geo || {}
    }


    const [data, status] = await postQuery(`*,-search-stadnamn-${process.env.SN_ENV}-search`, query)

    return Response.json(data, { status: status })
  }