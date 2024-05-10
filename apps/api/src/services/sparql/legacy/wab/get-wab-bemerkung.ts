import jsonld from 'jsonld'
import { DATA_SOURCES } from '../../../../config/constants';
import contexts from 'jsonld-contexts';
import { describeWabBemerkung } from './describe-wab-bemerkung';

const WAB_API = DATA_SOURCES.filter((service) => service.name === 'wab')[0].url

export async function getWabBemerkung(id: string) {
  const query = `
  PREFIX scho: <http://purl.org/wittgensteinsource/ont/scholar/0.1/>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX apf: <http://jena.hpl.hp.com/ARQ/property#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX fn: <http://www.w3.org/2005/xpath-functions#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX ws: <http://purl.org/wittgensteinsource/ont/>
  PREFIX dc: <http://purl.org/dc/elements/1.1/>
  PREFIX ubbont: <http://data.ub.uib.no/ontology/> 
  CONSTRUCT { 
    ?subject a ?class .
    ?subject rdfs:label ?label .
    ?subject ubbont:type ?classLabel .
    ?subject ubbont:existsContainsWord ?existsContainsWord .
    ?subject ws:variant ?variant .
    ?subject ws:dateString ?date .
    ?subject ws:created ?created .
    ?subject ws:madeBefore ?madeBefore .
    ?subject ws:madeAfter ?madeAfter .
    ?subject ws:dateSort ?dateSort .
    ?subject ws:publishedIn ?publishedIn .
    ?subject ws:publishedIn ?publishedIn2 .
    ?subject ws:discusses ?discussedIn .
    ?subject ws:subject ?discussedIn .
    ?subject ws:refersToPerson ?refersToPerson .
    ?subject ws:refersToWork ?refersToWork .
    ?subject ws:hasPart ?hasPart .
    ?subject ws:hasFacsView ?facsView .
    ?subject ws:hasHtmlView ?htmlView .
    ?subject ws:publishedInPart ?partLabel .
    ?subject ws:receiver ?receiver .
    ?subject ws:hasLanguage ?language .
    ?subject ws:textGenre ?textGenre .
    ?subject ws:sender ?sender .
  }
  WHERE {
    VALUES ?subject {<${id}>}
    ?subject rdf:type ?class .
    ?class rdfs:label ?classLabel .
    ?subject rdfs:label ?label0.
    BIND(str(?label0) AS ?label)
    BIND (exists{?subject ws:containsWord ?word } AS ?existsContainsWord )
    OPTIONAL { ?subject ws:contains/rdfs:label ?textGenre }
    OPTIONAL { ?subject ws:language/rdfs:label ?language }
    OPTIONAL { ?subject ws:hasFacsView ?facsView }
    OPTIONAL { ?subject ^ws:isDateOf/rdfs:label ?date . }
    OPTIONAL { ?subject ^ws:hasPart/rdfs:label ?hasPart . }
    OPTIONAL { ?subject ^ws:isDiscussedIn/rdfs:label ?discussedIn . }
    OPTIONAL { 
      ?subject ws:created ?created0 
      BIND(str(?created0) AS ?created)
    }
    OPTIONAL { 
      ?subject ws:madeBefore ?madeBefore0 
      BIND(str(?madeBefore0) AS ?madeBefore)
    }
    OPTIONAL { 
      ?subject ws:madeAfter ?madeAfter0 
      BIND(str(?madeAfter0) AS ?madeAfter)
    }
    BIND(coalesce(?created, ?madeAfter, ?madeBefore) AS ?dateSort)
    OPTIONAL { 
      ?subject ws:sender/rdfs:label ?sender .
      ?subject ws:receiver/rdfs:label ?receiver .
    }
    OPTIONAL { 
      #both facs and html view are generated from the ab xml:id, so both views always exists
      ?subject  ws:hasHtmlView  ?htmlView ;
        ws:hasFacsView|(ws:isPartOf/ws:hasFacsView) ?facsView .
    }
    OPTIONAL{ 
      ?subject ^ws:isWorkPublishedFrom ?publishedIn0 .
      ?publishedIn0	rdf:type ws:Werk .
      ?publishedIn0	rdfs:label ?publishedIn .
    }
    OPTIONAL { 
      ?subject ^ws:isReferredToIn ?refersToPerson0 .
      ?refersToPerson0 rdf:type scho:Person .
      ?refersToPerson0 rdfs:label ?refersToPerson .
    }
    OPTIONAL { 
      ?subject ws:isPublishedInWork ?publishedInPart0 .
      ?publishedInPart0 rdf:type ws:Part ;
        ws:isPartOf ?publishedInWork0 ;
        rdfs:label ?partLabel .
      ?publishedInWork0 rdf:type ws:Werk ;
        rdfs:label ?publishedIn2
    }
    # This adds 2 secs
    OPTIONAL { 
      ?subject ^ws:isReferredToIn ?refersToWork0 .
      ?refersToWork0 rdf:type ws:WittgensteinExternalSource .
      ?refersToWork0 rdfs:label ?refersToWork .
    }
    OPTIONAL { 
      ?subject ws:variant ?variant0 .
      ?date1 ws:isDateOf ?variant0 ;
        rdfs:label ?variantDateLabel .
      ?variant0 rdfs:label ?variantLabel
      BIND(concat("label::", str(?variantLabel), ";;", "date::", ?variantDateLabel) AS ?variant)
    }
  }`

  try {
    const results = await fetch(
      `${WAB_API}${encodeURIComponent(
        query
      )}&output=json`).then((res: any) => res.json());

    // Expand and compact the results using the legacy context
    const expanded = await jsonld.expand(results)
    const compacted = await jsonld.compact(expanded, contexts.wabLegacyContext)
    delete compacted["@context"]

    if (compacted['http://data.ub.uib.no/ontology/existsContainsWord' ?? 'existsContainsWord']) {
      const describe: any = await describeWabBemerkung(id);

      compacted.containsWord = describe.containsWord
      delete compacted['http://data.ub.uib.no/ontology/existsContainsWord' ?? 'existsContainsWord']
    }

    // Recreate ES suggest prop from the graph
    const label = compacted.label
      ? Array.isArray(compacted.label) ? compacted.label : [compacted.label]
      : []
    const type = compacted.type
      ? Array.isArray(compacted.type) ? compacted.type : [compacted.type]
      : []

    const array = [
      ...type,
      ...label,
    ].map((item: any) => item.toLowerCase())

    const withSuggest = {
      ...compacted,
      suggest: {
        input: array,
      }
    }

    return withSuggest;
  } catch (error) {
    return error;
  }
}
