import { prefix } from "termportal-ui/utils/utils";

export default function (base: string, termbase: string, id: string): string {
  const concept = termbase === "FBK" ? base + id : id;
  const log = {
    type: "concept",
    timestamp: new Date().toJSON(),
    termbase,
    concept,
  };

  const p2forbid = [
    "skosp:memberOf",
    "skos:related",
    "skos:narrower",
    "skos:broader",
    "rdfs:seeAlso",
    "dct:replaces",
    "dct:replacedBy"
  ];

  const query = `#log: ${JSON.stringify(log)}
${prefix}
PREFIX base: <${base}>

CONSTRUCT  {
  <${base}${id}> ?p ?o.
  ?o ?p2 ?o2.
  ?o2 ?p3 ?o3.}
WHERE {
  GRAPH ?GRAPH {
    <${base}${id}> ?p ?o.
    OPTIONAL {?o ?p2 ?o2.
      FILTER (?p2 NOT IN (${p2forbid.join(", ")}))
      OPTIONAL {?o2 ?p3 ?o3
        FILTER NOT EXISTS {
          ?o3 a skos:Concept
        }
        FILTER NOT EXISTS {
          ?o3 a skos:Collection
        }
      }
      FILTER NOT EXISTS {
        ?o a skos:Collection .
      }
    }
  }
}`;

  return query;
}
