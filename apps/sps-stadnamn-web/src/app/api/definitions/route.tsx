
import { postQuery } from '../_utils/post';

export async function GET(request: Request) {
  // Get the search parameter from the URL
  const url = new URL(request.url)
  const searchQuery = url.searchParams.get('q') || ""
  const vocab = url.searchParams.get('vocab') || "*"
  const size = url.searchParams.get('size') || 20


  const query: Record<string, any> = {
    "size": size,
    "_source": true,
    "sort": searchQuery ? "_score" : "label.keyword",
    "query": searchQuery ? {
      query_string: {
        query: `"${searchQuery}"^20 OR ${searchQuery}`,  // Exact phrase gets higher boost
        allow_leading_wildcard: true,
        default_operator: 'OR',
        fields: ["label^10", "definition"]
      }
    } : {
      "match_all": {}
    },
    "highlight": {
      "pre_tags": ["<mark>"],
      "post_tags": ["</mark>"],
      "boundary_scanner_locale": "nn-NO",
      "fields": {
        "label": {},
        "definition": {}
      }
    }
  }

  const [data, status] = await postQuery(`vocab_${vocab}`, query)
  return Response.json(data, { status: status })
}