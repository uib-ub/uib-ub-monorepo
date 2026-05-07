import { NextRequest, NextResponse } from 'next/server'
import { errors } from '@elastic/elasticsearch'
import { ES_INDEX, getEsClient } from '../../../utils/es'
import { linkSchema } from '../../../utils/link-schema'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    const { path } = await params
    const client = getEsClient()

    let source: unknown
    try {
      const result = await client.get({ index: ES_INDEX, id: path })
      source = result._source
    } catch (err) {
      if (err instanceof errors.ResponseError && err.statusCode === 404) {
        return NextResponse.json(
          { error: { message: `No redirect found` } },
          { status: 404 }
        )
      }
      throw err
    }

    const link = linkSchema.parse(source)

    // Atomically bump the view counter; failures here must not block the redirect.
    client
      .update({
        index: ES_INDEX,
        id: path,
        script: {
          source: 'ctx._source.views = (ctx._source.views == null ? 0 : ctx._source.views) + 1',
        },
      })
      .catch((err) => {
        console.error('Failed to increment views', err)
      })

    return NextResponse.redirect(link.originalURL, { status: link.redirectType })
  } catch (err) {
    return NextResponse.json(
      { error: { message: `An error ocurred, ${err}` } },
      { status: 500 }
    )
  }
}
