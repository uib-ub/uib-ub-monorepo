import 'server-only'

const GIT_APP_BASE = 'https://git.app.uib.no'
export const SITEMAP_GIT_REF = 'iiif-and-new-aggregation'

export async function fetchGitAppRawFile(params: {
  path: string
  ref?: string
  revalidateSeconds?: number
}): Promise<{ ok: true; content: string } | { ok: false; status: number; error: string }> {
  const { path, ref = SITEMAP_GIT_REF, revalidateSeconds = 3600 } = params

  // Use the GitLab "web raw" endpoint instead of the API raw endpoint, because these
  // files live under `lfs-data/` and need LFS resolution. The API endpoint can return
  // the LFS pointer file (which is plain text, not XML/JSON).
  const encodedPath = path
    .split('/')
    .map((s) => encodeURIComponent(s))
    .join('/')
  const url = `${GIT_APP_BASE}/spraksamlingane/stadnamn/datasett/stadnamn-archive/-/raw/${encodeURIComponent(ref)}/${encodedPath}`

  let res: Response
  try {
    res = await fetch(url, {
      cache: 'force-cache',
      next: { revalidate: revalidateSeconds },
    })
  } catch (e: any) {
    return { ok: false, status: 500, error: e?.message || 'Failed to fetch from git.app' }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { ok: false, status: res.status, error: text || `git.app responded with ${res.status}` }
  }

  const content = await res.text()
  return { ok: true, content }
}

export function getBaseUrlFromRequestHeaders(h: Headers): string {
  const proto = h.get('x-forwarded-proto') || 'http'
  const host = h.get('x-forwarded-host') || h.get('host')
  if (host) return `${proto}://${host}`
  return 'https://stadnamn.no'
}

export function rewriteSitemapLocOrigins(xml: string, baseUrl: string): string {
  // Rewrite <loc>https://any-host/path</loc> -> <loc>${baseUrl}/path</loc>
  // This keeps the paths stable while making the sitemap valid for the current deployment host.
  return xml.replace(/<loc>(https?:\/\/[^<]+)<\/loc>/g, (_m, rawUrl) => {
    try {
      const u = new URL(String(rawUrl))
      return `<loc>${baseUrl}${u.pathname}${u.search}</loc>`
    } catch {
      return `<loc>${rawUrl}</loc>`
    }
  })
}


