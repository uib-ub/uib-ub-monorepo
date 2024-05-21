import { prefix } from "termportal-ui/utils/utils";

export default function () {
  const query = `${prefix}
  PREFIX base: <http://wiki.terminologi.no/index.php/Special:URIResolver/>

  SELECT
    ?concept
    (CONCAT("{",GROUP_CONCAT(DISTINCT ?lab; SEPARATOR=", "), "}") AS ?labels)
    ?level
    ?published
    ?children
    (COUNT(DISTINCT ?termpost) AS ?concepts)
  WHERE {
    GRAPH <urn:x-arq:UnionGraph> {
      ?concept skosp:memberOf base:DOMENE-3ADOMENE ;
               skosp:publisere ?published ;
               skosxl:prefLabel ?label .
  
      OPTIONAL {
        ?termpost skosp:domene ?concept .
      }
      ?label skosxl:literalForm ?labelVal .
      BIND(
        CONCAT("\\"", lang(?labelVal), "\\"", ": \\"", STR(?labelVal), "\\"") AS ?lab
      )
      {
        SELECT
          ?concept
          (COUNT(DISTINCT ?parents) AS ?level)
          (GROUP_CONCAT(DISTINCT ?child; SEPARATOR=", ") AS ?children)
        WHERE {
          base:DOMENE-3AToppdomene skos:narrower* ?concept .
          ?concept skosp:memberOf base:DOMENE-3ADOMENE ;
                   skos:broader+ ?parents .
          OPTIONAL {
            ?concept skos:narrower ?child .
          }
        }
        GROUP BY ?concept
      }
    }
  }
  GROUP BY ?concept ?level ?children ?published
`;

  return query;
}
