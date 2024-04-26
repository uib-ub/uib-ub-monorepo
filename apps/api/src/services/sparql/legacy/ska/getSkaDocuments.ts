import jsonld from 'jsonld';
import { isObjectEmpty } from '../../../../helpers/isObjectEmpty';
import { DATA_SOURCES } from '../../../../config/constants';
import contexts from 'jsonld-contexts';

const SKA_API = DATA_SOURCES.filter((service) => service.name === 'ska')[0].url;

export async function getSkaDocuments() {
  const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
    PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
    PREFIX owl: <http://www.w3.org/2002/07/owl#> 
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
    PREFIX dct: <http://purl.org/dc/terms/> 
    PREFIX bibo: <http://purl.org/ontology/bibo/> 
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> 
    PREFIX event: <http://purl.org/NET/c4dm/event.owl#> 
    PREFIX ubbont: <http://data.ub.uib.no/ontology/> 
    CONSTRUCT { 
      ?sR a ?subclass . 
      ?sR rdf:about ?sR .
      ?sR ubbont:isDigitized ?isDigitized . 
      ?sR dct:identifier ?identifier . 
      ?sR rdfs:label ?coalescedLabel . 
      ?sR dct:isPartOf ?collectionStr . 
      ?sR event:producedIn ?eventStr . 
      ?sR dct:description ?descriptionStr. 
      ?sR foaf:maker ?makerStr . 
      ?sR dct:spatial ?spatialStr . 
      ?sR dct:subject ?topicStr . 
      ?sR dct:relation ?relationStr . 
      ?sR ubbont:hasThumbnail ?thumbStr . 
      ?sR dct:created ?created . 
      ?sR dct:available ?available . 
      ?sR ubbont:madeAfter ?madeAfter . 
      ?sR ubbont:madeBefore ?madeBefore . 
      ?sR ubbont:dateSort ?dateSort . 
    } 
    WHERE {
      GRAPH <urn:x-arq:UnionGraph> { 
        VALUES ?classes { bibo:Document ubbont:Object }
        ?subclass rdfs:subClassOf* ?classes . 
        ?s a ?subclass . 
        OPTIONAL { 
          ?s dct:identifier ?identifier 
        } .
        OPTIONAL { 
          ?s dct:title ?title .
          BIND (str(?title) AS ?titleStr) .
        } .
        OPTIONAL { 
          ?s rdfs:label ?label .
          BIND (str(?label) AS ?labelStr) .
        } .
        OPTIONAL { 
          ?s dct:spatial/skos:prefLabel ?spatial .
          BIND (str(?spatial) AS ?spatialStr) .
        } .
        OPTIONAL { 
          ?s dct:relation/foaf:name ?relation .
          BIND (str(?relation) AS ?relationStr) .
        } .
        OPTIONAL { 
          ?s dct:subject/skos:prefLabel ?topic .
          BIND (str(?topic) AS ?topicStr) .
        } .
        OPTIONAL { 
          ?s skos:prefLabel ?prefLabel .
          BIND (str(?prefLabel) AS ?prefLabelStr) .
        } .
        OPTIONAL { 
          ?s dct:description ?description .
          BIND (str(?description) AS ?descriptionStr) .
        } .
        OPTIONAL { 
          ?s foaf:maker/foaf:name ?maker .
          BIND (str(?maker) AS ?makerStr) .
        } .
        OPTIONAL { 
          ?s dct:isPartOf/dct:title ?collection.
          BIND (str(?collection) AS ?collectionStr) .
        } .
        OPTIONAL { 
          ?s event:producedIn/skos:prefLabel ?event .
          BIND (str(?event) AS ?eventStr) .
        } .
        OPTIONAL { 
          ?s ubbont:hasThumbnail ?thumb 
          BIND (str(?thumb) AS ?thumbStr) .
        } .
        OPTIONAL { 
          ?s dct:created ?created0 .
          BIND (str(?created0) AS ?created) .
        } .
        OPTIONAL { 
          ?s dct:available ?available0 .
          BIND (str(?available0) AS ?available) .
        } .
        OPTIONAL { 
          ?s ubbont:madeAfter ?madeAfter0 .
          BIND (str(?madeAfter0) AS ?madeAfter) .
        } .
        OPTIONAL { 
          ?s ubbont:madeBefore ?madeBefore0 .
          BIND (str(?madeBefore0) AS ?madeBefore) .
        } .
        OPTIONAL { 
          ?s ubbont:dateSort ?dateSort0 
        } .
        MINUS { ?s a ubbont:Page.} 
        BIND (coalesce(?created, ?madeAfter, ?madeBefore) AS ?dateSort) 
        BIND (coalesce(?titleStr, ?labelStr) AS ?coalescedLabel) 
        BIND(EXISTS{?s ubbont:hasRepresentation ?rep} AS ?isDigitized0) 
        BIND(xsd:string(if(?isDigitized0 = true, "Digitalisert", "Ikke digitalisert")) as ?isDigitized) 
        BIND (iri(replace(str(?s), "http://data.ub.uib.no", "https://katalog.skeivtarkiv.no")) AS ?sR )
      }
    }`

  try {
    const result = await fetch(
      `${SKA_API}${encodeURIComponent(
        query
      )}&output=json`).then((res: any) => res.json());

    if (isObjectEmpty(result)) {
      return []
    }

    // Expand and compact the result using the legacy context
    const expanded = await jsonld.expand(result)
    const compacted = await jsonld.compact(expanded, contexts.skaLegacyContext)
    const graph = compacted['@graph'] as any[] ?? []

    // Recreate ES suggest prop from the graph
    const withSuggest = graph.map((item: any) => {
      const label = item.label
        ? Array.isArray(item.label) ? item.label : [item.label]
        : []
      const title = item.title
        ? Array.isArray(item.title) ? item.title : [item.title]
        : []
      const description = item.description
        ? Array.isArray(item.description) ? item.description : [item.description]
        : []
      const identifier = item.identifier
        ? Array.isArray(item.identifier) ? item.identifier : [item.identifier]
        : []
      const type = item.type
        ? Array.isArray(item.type) ? item.type : [item.type]
        : []
      const maker = item.maker ?? []
      const subject = item.subject ?? []
      const spatial = item.spatial ?? []
      const array = [
        ...identifier,
        ...type,
        ...label,
        ...title,
        ...description ?? undefined,
        ...subject,
        ...spatial,
        ...maker
      ].map((item: any) => item.toLowerCase())

      // The Drupal ES module uses "field_tags:name" which is illegal as a JSONLD key
      item['field_tags:name'] = item.subject

      return {
        ...item,
        suggest: {
          input: array,
        }
      }
    })

    return withSuggest;
  } catch (error) {
    return error;
  }
}