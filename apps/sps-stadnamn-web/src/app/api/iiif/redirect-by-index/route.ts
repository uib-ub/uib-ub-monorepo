import { postQuery } from '@/app/api/_utils/post'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const partOf = url.searchParams.get('partOf')
  const orderStr = url.searchParams.get('order')

  if (!partOf || !orderStr) {
    return Response.json(
      { error: 'INVALID_QUERY', details: 'partOf and order are required' },
      { status: 400 },
    )
  }

  const order = parseInt(orderStr, 10)
  if (!Number.isFinite(order)) {
    return Response.json({ error: 'INVALID_QUERY', details: 'order must be a number' }, { status: 400 })
  }

  const query = {
    size: 1,
    fields: ['uuid'],
    _source: false,
    query: {
      bool: {
        must: [{ term: { partOf } }, { term: { order } }],
      },
    },
  }

  const [res, status] = await postQuery('iiif_*', query)
  if (status !== 200) {
    return Response.json({ error: 'UPSTREAM_ERROR', upstreamStatus: status, upstream: res }, { status })
  }

  const hit = res?.hits?.hits?.[0]
  if (!hit?._id || !hit?.fields?.uuid?.[0]) {
    return Response.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  return Response.json({ uuid: hit.fields.uuid[0] }, { status: 200 })
}


