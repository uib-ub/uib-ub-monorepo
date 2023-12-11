export const skosFrame = {
  "@context": {
    "@version": 1.1,
    "dct": "http://purl.org/dc/terms/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "ubbont": "http://data.ub.uib.no/ontology/",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "dc": "http://purl.org/dc/elements/1.1/",
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "id": "@id",
    "type": "@type",
    "ConceptScheme": {
      "@id": "skos:ConceptScheme"
    },
    "Concept": {
      "@id": "skos:Concept"
    },
    "broadMatch": {
      "@id": "skos:broadMatch",
      "@type": "@id"
    },
    "broader": {
      "@id": "skos:broader",
    },
    "broaderTransitive": {
      "@id": "skos:broaderTransitive",
      "@type": "@id"
    },
    "closeMatch": {
      "@id": "skos:closeMatch",
      "@type": "@id"
    },
    "exactMatch": {
      "@id": "skos:exactMatch",
      "@type": "@id"
    },
    "hasTopConcept": {
      "@id": "skos:hasTopConcept",
      "@type": "@id"
    },
    "mappingRelation": {
      "@id": "skos:mappingRelation",
      "@type": "@id"
    },
    "member": {
      "@id": "skos:member",
      "@type": "@id"
    },
    "memberList": {
      "@id": "skos:memberList",
      "@type": "@id"
    },
    "narrowMatch": {
      "@id": "skos:narrowMatch",
      "@type": "@id"
    },
    "narrower": {
      "@id": "skos:narrower",
      "@type": "@id"
    },
    "narrowerTransitive": {
      "@id": "skos:narrowerTransitive",
      "@type": "@id"
    },
    "related": {
      "@id": "skos:related",
      "@type": "@id"
    },
    "relatedMatch": {
      "@id": "skos:relatedMatch",
      "@type": "@id"
    },
    "semanticRelation": {
      "@id": "skos:semanticRelation",
      "@type": "@id"
    },
    "topConceptOf": {
      "@id": "skos:topConceptOf",
      "@type": "@id"
    },
    "inScheme": {
      "@id": "skos:inScheme",
    },
    "prefLabel": { "@id": "skos:prefLabel" },
    "prefLabel_none": { "@id": "skos:prefLabel", "@language": "none" },
    "prefLabel_no": { "@id": "skos:prefLabel", "@language": "no" },
    "prefLabel_en": { "@id": "skos:prefLabel", "@language": "en" },
    "prefLabel_la": { "@id": "skos:prefLabel", "@language": "la" },
    "prefLabel_ar": { "@id": "skos:prefLabel", "@language": "ar" },
    "altLabel": { "@id": "skos:altLabel" },
    "altLabel_none": { "@id": "skos:altLabel", "@language": "none" },
    "altLabel_no": { "@id": "skos:altLabel", "@language": "no" },
    "altLabel_en": { "@id": "skos:altLabel", "@language": "en" },
    "altLabel_la": { "@id": "skos:altLabel", "@language": "la" },
    "altLabel_ar": { "@id": "skos:altLabel", "@language": "ar" },
    "description": {
      "@id": "http://purl.org/dc/elements/1.1/description",
      "@container": "@language"
    },
    "identifier": {
      "@id": "dct:identifier"
    },
    "homepage": {
      "@id": "ubbont:homepage"
    },
    "available": {
      "@id": "dct:available",
      "@type": "http://www.w3.org/2001/XMLSchema#date"
    },
    "modified": {
      "@id": "dct:modified",
      "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
    },
    "label": {
      "@id": "rdfs:label",
      "@container": [
        "@language",
        "@set"
      ]
    }
  }
}