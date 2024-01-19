import { prefix } from "termportal-ui/utils/utils";

export default function () {
  const query = `
  ${prefix}

  SELECT DISTINCT
    ?label
    ?concepts
    ?termsNb
    ?termsNn
    ?termsEn
    ?defNb
    ?defNn
    ?defEn
  WHERE {
    GRAPH <urn:x-arq:UnionGraph> {
      {
        SELECT ?label ?tb (COALESCE(count(DISTINCT ?concept), 0) as ?concepts )
        WHERE {
            ?tb rdfs:label ?label .
            ?concept skosp:memberOf ?tb .
            FILTER ( lang(?label) = 'nb') .
        }
        GROUP BY ?label ?tb
      }
     {
        SELECT ?tb ( COALESCE(count(DISTINCT ?concept), 0) as ?termsNb )
        WHERE {
          ?tb rdf:type skos:Collection .
          OPTIONAL {
            ?concept skosp:memberOf ?tb .
            ?concept skosxl:prefLabel|skosxl:altLabel|skosxl:hiddenLabel ?label .
            ?label skosxl:literalForm ?term .
            FILTER ( lang(?term) = 'nb' ) .
          }
        }
        GROUP BY ?tb
      }
      {
        SELECT ?tb (COALESCE(count(DISTINCT ?concept), 0) as ?termsNn )
        WHERE {
          ?tb rdf:type skos:Collection .
          OPTIONAL {
            ?concept skosp:memberOf ?tb .
            ?concept skosxl:prefLabel|skosxl:altLabel|skosxl:hiddenLabel ?label .
            ?label skosxl:literalForm ?term .
            FILTER ( lang(?term) = 'nn' ) .
          }
        }
        GROUP BY ?tb
      }
      {
        SELECT ?tb (COALESCE(count(DISTINCT ?concept), 0) as ?termsEn)
        WHERE {
          ?tb rdf:type skos:Collection .
          OPTIONAL {
            ?concept skosp:memberOf ?tb .
            ?concept skosxl:prefLabel|skosxl:altLabel|skosxl:hiddenLabel ?label .
            ?label skosxl:literalForm ?term .
            FILTER ( lang(?term) = 'en' ) .
          }
        }
        GROUP BY ?tb
      }
      {
        SELECT ?tb (COALESCE(count(DISTINCT ?concept), 0) as ?defNb)
        WHERE {
          ?tb rdf:type skos:Collection
          OPTIONAL {
            ?concept skosp:memberOf ?tb .
            ?concept skosno:definisjon ?def .
            ?def rdfs:label ?defl .
            FILTER ( lang(?defl) = 'nb' ) .
          }
        }
        GROUP BY ?tb
      }
      {
        SELECT ?tb (COALESCE(count(DISTINCT ?concept), 0) as ?defNn)
        WHERE {
          ?tb rdf:type skos:Collection
          OPTIONAL {
            ?concept skosp:memberOf ?tb .
            ?concept skosno:definisjon ?def .
            ?def rdfs:label ?defl .
            FILTER ( lang(?defl) = 'nn' ) .
          }
        }
        GROUP BY ?tb
      }
      {
        SELECT ?tb (COALESCE(count(DISTINCT ?concept), 0) as ?defEn)
        WHERE {
          ?tb rdf:type skos:Collection .
          OPTIONAL {
            ?concept skosp:memberOf ?tb .
            ?concept skosno:definisjon ?def .
            ?def rdfs:label ?defl .
            FILTER ( lang(?defl) = 'en' ) .
          }
        }
        GROUP BY ?tb
      }
    }
  }
  `;
  return query;
}
