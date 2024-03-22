export const iiifManifestContext = {
  "@context": {
    "id": "@id",
    "type": "@type",
    "body": {
      "@id": "http://www.w3.org/ns/oa#body",
    },
    "Annotation": {
      "@id": "http://www.w3.org/ns/oa#Annotation",
      "@type": "@id"
    },
    "items": {
      "@id": "http://iiif.io/api/presentation/3#items",
      "@type": "@id"
    },
    "homepage": {
      "@id": "http://iiif.io/api/presentation/3#homepage",
      "@type": "@id",
      "@container": [
        "@set"
      ],
    },
    "seeAlso": {
      "@id": "http://www.w3.org/2000/01/rdf-schema#seeAlso",
      "@type": "@id"
    },
    "Manifest": {
      "@id": "http://iiif.io/api/presentation/3#Manifest",
      "@type": "@id"
    },
    "Range": {
      "@id": "http://iiif.io/api/presentation/3#Range",
      "@type": "@id"
    },
    "Canvas": {
      "@id": "http://iiif.io/api/presentation/3#Canvas",
      "@type": "@id"
    },
    "structures": {
      "@id": "http://iiif.io/api/presentation/3#structures",
      "@type": "@id"
    },
    "thumbnail": {
      "@id": "http://iiif.io/api/presentation/3#thumbnail",
      "@container": [
        "@set"
      ]
    },
    "description": {
      "@id": "http://purl.org/dc/elements/1.1/description",
      "@container": "@language"
    },
    "identifier": {
      "@id": "http://purl.org/dc/terms/identifier"
    },
    "label": {
      "@id": "rdfs:label",
      "@container": [
        "@language",
        "@set"
      ],
    },
    "metadata": {
      "@type": "@id",
      "@id": "sc:metadataEntries",
      "@container": "@list"
    },
    "summary": {
      "@id": "as:summary",
      "@container": [
        "@language",
        "@set"
      ],
    },
    "hasXSView": {
      "@id": "ubbont:hasXSView",
      "@container": [
        "@set"
      ],
    },
    "hasSMView": {
      "@id": "ubbont:hasSMView",
      "@container": [
        "@set"
      ],
    },
    "hasMDView": {
      "@id": "ubbont:hasMDView",
      "@container": [
        "@set"
      ],
    },
    "hasXLView": {
      "@id": "ubbont:hasXLView",
      "@container": [
        "@set"
      ],
    },
    "sc": "http://iiif.io/api/presentation/3#",
    "oa": "http://www.w3.org/ns/oa#",
    "dct": "http://purl.org/dc/terms/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "ubbont": "http://data.ub.uib.no/ontology/",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "dc": "http://purl.org/dc/elements/1.1/",
    "as": "http://www.w3.org/ns/activitystreams#",
  }
}