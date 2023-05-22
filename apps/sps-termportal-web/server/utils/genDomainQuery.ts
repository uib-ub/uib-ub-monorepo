export default function (base: string): string {
  const query = `
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX base: <${base}>

CONSTRUCT  {
    <${base}DOMENE-3AToppdomene> skos:narrower ?c;
        rdf:type skos:Concept.
    ?c skos:narrower ?c2;
        rdf:type skos:Concept.
    ?c2 skos:narrower ?c3;
        rdf:type skos:Concept.
    ?c3 skos:narrower ?c4;
        rdf:type skos:Concept. }
WHERE {
    GRAPH ?GRAPH {
        <${base}DOMENE-3AToppdomene> skos:narrower ?c.
            OPTIONAL { ?c skos:narrower ?c2.
                OPTIONAL { ?c2 skos:narrower ?c3.
                    OPTIONAL { ?c3 skos:narrower ?c4. }
                }
            }
        }
    }`;

  return query;
}
