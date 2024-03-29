const shaclContext = {
  "@context": {
    "@version": 1.1,
    "@vocab": "http://www.w3.org/ns/shacl#",
    "sh": "http://www.w3.org/ns/shacl#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "mshapes": "http://marcusshapes.com#",
    "dct": "http://purl.org/dc/terms/",
    "ValidationReport": {
      "@type": "@id"
    },
    "ValidationResult": {
      "@type": "@id"
    },
    "comment": "rdfs:comment",
    "target": {
      "@type": "@id"
    },
    "conforms": {
      "@type": "xsd:boolean"
    },
    "value": {
      "@type": "@id"
    },
    "focusNode": {
      "@type": "@id"
    },
    "targetClass": {
      "@type": "@id"
    },
    "targetObjectsOf": {
      "@type": "@id"
    },
    "targetSubjectsOf": {
      "@type": "@id"
    },
    "severity": {
      "@type": "@id"
    },
    "result": {
      "@type": "@id"
    },
    "detail": {
      "@type": "@id"
    },
    "resultPath": {
      "@type": "@id"
    },
    "resultSeverity": {
      "@type": "@id"
    },
    "sourceShape": {
      "@type": "@id"
    },
    "sourceConstraintComponent": {
      "@type": "@id"
    },
    "prefixes": {
      "@type": "@id"
    },
    "declare": {
      "@type": "@id"
    },
    "namespace": {
      "@type": "xsd:anyURI"
    },
    "shapesGraph": {
      "@type": "@id"
    },
    "path": {
      "@type": "@id"
    },
    "inversePath": {
      "@type": "@id"
    },
    "alternativePath": {
      "@type": "@id",
      "@container": "@list"
    },
    "zeroOrMorePath": {
      "@type": "@id"
    },
    "oneOrMorePath": {
      "@type": "@id"
    },
    "zeroOrOnePath": {
      "@type": "@id"
    },
    "parameter": {
      "@type": "@id"
    },
    "validator": {
      "@type": "@id"
    },
    "nodeValidator": {
      "@type": "@id"
    },
    "propertyValidator": {
      "@type": "@id"
    },
    "and": {
      "@type": "@id",
      "@container": "@list"
    },
    "class": {
      "@type": "@id"
    },
    "ignoredProperties": {
      "@type": "@id",
      "@container": "@list"
    },
    "datatype": {
      "@type": "@id"
    },
    "disjoint": {
      "@type": "@id"
    },
    "equals": {
      "@type": "@id"
    },
    "in": {
      "@container": "@list"
    },
    "languageIn": {
      "@container": "@list"
    },
    "lessThan": {
      "@type": "@id"
    },
    "lessThanOrEquals": {
      "@type": "@id"
    },
    "node": {
      "@type": "@id"
    },
    "nodeKind": {
      "@type": "@id"
    },
    "not": {
      "@type": "@id"
    },
    "or": {
      "@type": "@id",
      "@container": "@list"
    },
    "property": {
      "@type": "@id"
    },
    "qualifiedValueShape": {
      "@type": "@id"
    },
    "xone": {
      "@type": "@id",
      "@container": "@list"
    },
    "sparql": {
      "@type": "@id"
    },
    "derivedValues": {
      "@type": "@id"
    },
    "group": {
      "@type": "@id"
    },
    "returnType": {
      "@type": "@id"
    },
    "resultAnnotation": {
      "@type": "@id"
    },
    "annotationProperty": {
      "@type": "@id"
    },
    "maxCount": {
      "@type": "xsd:integer"
    },
    "maxLength": {
      "@type": "xsd:integer"
    },
    "minCount": {
      "@type": "xsd:integer"
    },
    "minLength": {
      "@type": "xsd:integer"
    },
    "qualifiedMaxCount": {
      "@type": "xsd:integer"
    },
    "qualifiedMinCount": {
      "@type": "xsd:integer"
    }
  }
}

export default shaclContext