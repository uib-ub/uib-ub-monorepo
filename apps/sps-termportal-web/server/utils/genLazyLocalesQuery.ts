export default function (base: string): string {
  const query = `
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX ns: <http://spraksamlingane.no/terminlogi/named/>
    PREFIX base: <${base}>

    SELECT ?page ?label {
      {
        GRAPH <urn:x-arq:UnionGraph> {
          ?page a skos:Collection .
          ?page rdfs:label ?label .
          FILTER (strStarts(str(?page), '${base}'))
          FILTER (lang(?label) != '')
        }
      }
      UNION
      {
        GRAPH ns:DOMENE {
          ?page a skos:Concept ;
                skosxl:prefLabel ?xl .
          ?xl skosxl:literalForm ?label .
          FILTER (lang(?label) != '')
        }
      }
    }
    `;
  return query;
}
