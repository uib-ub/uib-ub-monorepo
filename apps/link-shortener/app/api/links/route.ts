import { NextRequest, NextResponse } from 'next/server'
import { ES_INDEX, getEsClient } from '../../../utils/es'
import { linkSchema } from '../../../utils/link-schema'

export async function GET(request: NextRequest) {
  try {
    const client = getEsClient()
    const result = await client.search({
      index: ES_INDEX,
      size: 1000,
      sort: [{ created: 'desc' }],
    })

    const links = result.hits.hits
      .map((hit) => {
        const parsed = linkSchema.safeParse(hit._source)
        return parsed.success ? parsed.data : null
      })
      .filter((link): link is NonNullable<typeof link> => link !== null)

    return NextResponse.json(links, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      { error: { message: `An error ocurred, ${err}` } },
      { status: 500 }
    )
  }
}
