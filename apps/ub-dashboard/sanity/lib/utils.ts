import { DefineUrlResolverOptions, UrlResolver } from 'sanity-plugin-iframe-pane'

// Used to generate URLs for drafts and live previews
export const PREVIEW_BASE_URL = '/api/draft'

export function defineUrlResolver(options: DefineUrlResolverOptions): UrlResolver {
  const { base, requiresSlug = [] } = options
  const MissingSlug = 'Missing Slug'
  return (document, urlSecret) => {
    const url = new URL(base, location.origin)
    url.searchParams.set('type', document._type)
    const slug = (document?._id as any).replace('drafts.', '')
    if (slug) {
      url.searchParams.set('slug', slug)
    } else if (requiresSlug.includes(document._type)) {
      return MissingSlug
    }
    if (urlSecret) {
      url.searchParams.set('secret', urlSecret)
    }
    return url.toString()
  }
}