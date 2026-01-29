import { postQuery } from '../../_utils/post'

type LegacyChildrenGroupsRequest = {
  children: unknown
  perspective?: unknown
}

type GroupSummary = {
  id: string
  label?: string
}

export async function POST(request: Request) {
  let body: LegacyChildrenGroupsRequest
  try {
    body = (await request.json()) as LegacyChildrenGroupsRequest
  } catch {
    return Response.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const perspective = typeof body.perspective === 'string' && body.perspective.length > 0 ? body.perspective : 'all'

  const children =
    Array.isArray(body.children) ? body.children.filter((v): v is string => typeof v === 'string' && v.length > 0) : []

  if (children.length === 0) {
    return Response.json({ error: 'MISSING_CHILDREN' }, { status: 400 })
  }

  // Resolve group metadata for a list of UUIDs (including redirects).
  const query = {
    size: Math.min(children.length, 1000),
    track_scores: false,
    _source: ['group'],
    query: {
      bool: {
        should: [{ terms: { uuid: children } }, { terms: { redirects: children } }],
        minimum_should_match: 1,
      },
    },
  }

  const [data, status] = await postQuery(perspective, query)
  if (status !== 200) {
    return Response.json(data, { status })
  }

  const groupsById = new Map<string, GroupSummary>()
  for (const hit of data?.hits?.hits ?? []) {
    const group = hit?._source?.group
    const id = typeof group?.id === 'string' ? group.id : undefined
    const label = typeof group?.label === 'string' ? group.label : undefined
    if (!id) continue
    // Exclude technical / non-user-facing groups.
    if (id === 'suppressed' || id === 'noname') continue
    if (!groupsById.has(id)) groupsById.set(id, { id, ...(label ? { label } : {}) })
  }

  const groups = Array.from(groupsById.values()).sort((a, b) => (a.label || a.id).localeCompare(b.label || b.id, 'nb'))

  return Response.json({ groups }, { status: 200 })
}
