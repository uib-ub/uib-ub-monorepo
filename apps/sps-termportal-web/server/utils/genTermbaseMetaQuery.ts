import { prefix } from "termportal-ui/utils/utils";

export default function (base: string): string {
  const query = `
  ${prefix}

  SELECT ?page ?versionInfo (GROUP_CONCAT(DISTINCT ?lang; separator=",") AS ?languages) {
    {
      GRAPH <urn:x-arq:UnionGraph> {
        ?page a skos:Collection ;
                dct:language ?lang .
        OPTIONAL {
          ?page owl:versionInfo ?versionInfo .
          }
        }
      }
    }
    GROUP BY ?page ?versionInfo
  `;
  return query;
}
