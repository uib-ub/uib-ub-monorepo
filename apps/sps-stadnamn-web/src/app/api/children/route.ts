export const runtime = 'edge'
import { resultConfig } from "@/config/search-config";
import { postQuery } from "../_utils/post";
export async function POST(request: Request) {
    const body = await request.json()
    const uuids = body.children
    if (!uuids) {
        return Response.json({error: "No uuids provided"}, { status: 400 })
    }


    const searchParams = new URLSearchParams(new URL(request.url).search)
    const geo = searchParams.get('geo') &&  {
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
        _source: true,
        query: {
            terms: {
                "uuid": uuids
            }
        },
        ...geo || {}
    }


    const [data, status] = await postQuery(`*,-search-stadnamn-${process.env.SN_ENV}-search`, query)
    console.log('data', data)

    return Response.json(data, { status: status })
  }