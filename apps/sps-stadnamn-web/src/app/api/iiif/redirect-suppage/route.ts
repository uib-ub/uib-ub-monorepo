import { postQuery } from '@/app/api/_utils/post'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const suppageType = url.searchParams.get('suppageType')
  const suppageId = url.searchParams.get('suppageId')

  if (!suppageType || !suppageId) {
    return Response.json(
      { error: 'INVALID_QUERY', details: 'suppageType and suppageId are required' },
      { status: 400 },
    )
  }

  let field: string | null = null
  if (suppageType === 'canvas') field = 'images.canvasUuid'
  if (suppageType === 'annotation') field = 'images.annotationUuid'
  if (suppageType === 'annotationPage') field = 'images.annotationPageUuid'

  if (!field) {
    return Response.json({ error: 'INVALID_QUERY', details: 'Unknown suppageType' }, { status: 400 })
  }

  const query = {
    size: 1,
    fields: ['uuid'],
    _source: false,
    query: {
      term: { [field]: suppageId },
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


