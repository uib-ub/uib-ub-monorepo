export const runtime = 'edge'
import { fieldConfig, resultConfig } from "@/config/search-config";
import { postQuery } from "../_utils/post";
import { getSortArray, treeSettings } from "@/config/server-config";
export async function POST(request: Request) {
    const body = await request.json()
    const uuids = body.children
    const mode = body.mode
    const within = body.within 
    const dataset = body.dataset

    if (!mode) {
        return Response.json({error: "Mode is required"}, { status: 400 })
    }

    if (!uuids && !(dataset && within)) {
        return Response.json({error: "Either uuids or both dataset and within are required"}, { status: 400 })
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

 
    const query = {
        size: 1000,
        _source: false,
        fields: ["uuid","label", "attestations.label", "altLabels", "sosi",
                    ...dataset && treeSettings[dataset] ? Object.entries(fieldConfig[dataset]).filter(([key, value]) => value.cadastreTable).map(([key, value]) => key) : [],
                    ...dataset && treeSettings[dataset] ? [treeSettings[dataset].leaf.replace("__", ".")] : []
        ],
        query: {
            ...(uuids ? {
                terms: {
                    "uuid": uuids
                }
            } : {
                term: {
                    "within.keyword": within
                }
            })
        },
        ...(dataset ? {sort: getSortArray(dataset)} : {}),
        ...geo || {}
    }


    const [data, status] = await postQuery(dataset || `*,-search-stadnamn-${process.env.SN_ENV}-search`, query)

    return Response.json(data, { status: status })
  }