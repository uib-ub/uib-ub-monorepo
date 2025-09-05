//export const runtime = 'edge'

import { extractFacets } from '../../_utils/facets'
import { getQueryString } from '../../_utils/query-string';
import { postQuery } from '../../_utils/post';
import { getSortArray } from '@/config/server-config';

export async function POST(request: Request) {
  const body = await request.json();

  const searchTerms = body.searchTerms
  const h3 = body.h3
  const gnidu = body.gnidu
  const snid = body.snid

  const query: Record<string,any> = {
    "size":  (h3 || gnidu) ? 1000 : 10,
    "track_scores": true,
    "sort": [
      {
        _score: "desc"
      },
      {
        boost: {
          order: "desc",
          missing: "_last"
        }
      },
    ],
    "_source": ["group.id", "label", "adm1", "adm2", "uuid", "sosi", "description", "attestations", "year", "gnidu", "h3"],
  }

  // Build the query with bool structure
  const boolQuery: any = {
    "bool": {
      "must": [],
      "should": [],
      "minimum_should_match": 0
    }
  }




  // Define target fields with their boost values
  const targetFields = [
    { field: "label", boost: 3.0 },
    { field: "altLabels", boost: 2.0 },
    //{ field: "attestations.label", boost: 1.0 }
  ]

  // Build many-to-many fuzzy search clauses
  searchTerms.forEach((searchTerm: string) => {
    targetFields.forEach(({ field, boost }) => {
      boolQuery.bool.should.push({
        "match": {
          [field]: {
            "query": searchTerm,
            "boost": boost,
            "fuzziness": "AUTO" //(h3 || gnidu) ? "AUTO" : 1,
          }
        }
      })
    })
  })

  // Create a separate bool query for required geographic/identifier filters
  const identifierQuery: any = {
    "bool": {
      "should": [],
      "minimum_should_match": 1
    }
  }

  // Add geographic/identifier filters as should clauses within the required section
  /*
  if (h3 && Array.isArray(h3) && h3.length > 0) {
    identifierQuery.bool.should.push({
      "terms": {
        "h3": h3
      }
    })
  }
    */

  if (body.lat && body.lon) {
    identifierQuery.bool.should.push({
      "geo_distance": {
        "distance": "3km",
        "location": {
          "lat": body.lat,
          "lon": body.lon
        }
      }
    })
  }

  if (gnidu && Array.isArray(gnidu) && gnidu.length > 0) {
    identifierQuery.bool.should.push({
      "terms": {
        "gnidu": gnidu
      }
    })
  }
    

  // Only add the identifier requirement if we have identifier filters
  if (identifierQuery.bool.should.length > 0) {
    boolQuery.bool.must.push(identifierQuery)
  }

  // Set minimum_should_match for text matching if we have text clauses
  if (boolQuery.bool.should.length > 0) {
    boolQuery.bool.minimum_should_match = 1
  }

  // Only set the query if we have any clauses
  if (boolQuery.bool.should.length > 0 || boolQuery.bool.must.length > 0) {
    query.query = boolQuery
  }

  const [data, status] = await postQuery('all', query)
  return Response.json(data, {status: status})
}