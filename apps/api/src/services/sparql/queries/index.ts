import { SPARQL_PREFIXES } from '@config/constants'

export const countSparqlQuery = `
  PREFIX bibo: <http://purl.org/ontology/bibo/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX ubbont: <http://data.ub.uib.no/ontology/>

  SELECT (count(?uri) as ?total) WHERE { 
    SERVICE <cache:> { 
      SELECT ?uri WHERE 
        { 
          VALUES ?types { %types }
          ?uri a ?types ;
            dct:identifier ?id .
        }
    }
  }
`

export const countSubClassOfSparqlQuery = `
  PREFIX bibo: <http://purl.org/ontology/bibo/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX ubbont: <http://data.ub.uib.no/ontology/>

  SELECT (count(?uri) as ?total) WHERE { 
    SERVICE <cache:> { 
      SELECT ?uri WHERE 
        { 
          ?uri rdf:type/rdfs:subClassOf* %type ;
            ubbont:showWeb true ;
            dct:identifier ?id .
        }
    }
  }
`

export const personOrGroupSparqlQuery = `
  ${SPARQL_PREFIXES}
  CONSTRUCT {
    ?uri ?p ?o ;
      a %class ;
      crm:P2_has_type ?type ;
      dct:created ?created ;
      rdfs:label ?label ;
      foaf:homepage ?homepage .
    ?o a ?oClass ;
      ?p2 ?o2 ;
      dct:identifier ?identifier ;
      rdfs:label ?oLabel ;
      ubbont:hasURI ?oURI .
  } WHERE { 
    VALUES ?id {"%id"}
    ?uri dct:identifier ?id ;
      foaf:name ?name ;
      ?p ?o ;
      a ?class .
    OPTIONAL {?uri dct:title ?title } .
    OPTIONAL {?uri foaf:name ?name } .
    OPTIONAL {?uri skos:prefLabel ?prefLabel } .
    OPTIONAL {?uri rdfs:label ?rdfsLabel } .
    BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel, ?id) AS ?label) .
    OPTIONAL { 
      ?o a ?oClass .
      OPTIONAL { ?o dct:identifier ?identifier } .
      OPTIONAL { ?o (dct:title|foaf:name|skos:prefLabel|rdfs:label) ?oLabel } . 
      OPTIONAL { ?o foaf:gender ?gender } .
      OPTIONAL { ?o ubbont:hasURI ?oURI } .
      FILTER(?oClass != rdfs:Class) .
    }
    FILTER(?o != ?uri)
    BIND(REPLACE(STR(?class), ".+[/#]([^/#]+)$", "$1") as ?type)
    BIND(iri(REPLACE(str(?uri), "http://data.ub.uib.no","https://marcus.uib.no","i")) as ?homepage)
    FILTER(?p NOT IN (rdf:type, ubbont:reproduced, foaf:depiction, skos:inScheme, dct:hasPart, ubbont:cataloguer, ubbont:internalNote, ubbont:showWeb, foaf:made))
  }
`

export const listSparqlQuery = `
  ${SPARQL_PREFIXES}
  CONSTRUCT {
    ?uri a %type ;
      dct:identifier ?id .
  } WHERE { 
    SERVICE <cache:> { 
      SELECT ?uri ?id WHERE 
        { 
          VALUES ?types { %types }
          ?uri rdf:type ?types ;
            dct:identifier ?id .
        }
      ORDER BY ?id
      OFFSET %page
      LIMIT %limit
    }
  }
`

export const listSubClassOfSparqlQuery = `
    ${SPARQL_PREFIXES}
    CONSTRUCT {
      ?uri a %type ;
        dct:identifier ?id ;
    } WHERE { 
      SERVICE <cache:> { 
        SELECT ?uri ?id WHERE 
          { 
            ?uri rdf:type/rdfs:subClassOf* %types ;
              dct:identifier ?id .
          }
        ORDER BY ?id
        OFFSET %page
        LIMIT %limit
      }
    }
  `

export const listItemsSparqlQuery = `
  ${SPARQL_PREFIXES}
  CONSTRUCT {
    ?uri a ?class ; 
      dct:identifier ?id ;
      ubbont:isDigitized ?isDigitized .
  } WHERE { 
    SERVICE <cache:> { 
      SELECT ?uri ?class ?id ?isDigitized WHERE 
        { 
          ?uri rdf:type/rdfs:subClassOf* bibo:Document ;
            a ?class ;
            ubbont:showWeb true ;
            dct:identifier ?id .
          BIND(EXISTS{?uri ubbont:hasRepresentation ?repr} AS ?isDigitized)
        }
      ORDER BY ?id
      OFFSET %page
      LIMIT %limit
    }
  }
`

export const itemSparqlQuery = `
  ${SPARQL_PREFIXES}
  CONSTRUCT {
    ?uri ?p ?o ;
      a crm:E22_Human-Made_Object ;
      crm:P2_has_type ?type ;
      dct:title ?label ;
      dct:created ?created ;
      rdfs:label ?label ;
      muna:image ?image ;
      ubbont:hasThumbnail ?thumbString ;
      ubbont:hasTranscription ?transcription ;
      foaf:homepage ?homepage .
    ?o a ?oClass ;
      ?p2 ?o2 ;
      dct:identifier ?identifier ;
      rdfs:label ?oLabel ;
      wgs:long ?longDouble ;
      wgs:lat ?latDouble .
  } WHERE { 
    VALUES ?id {"%id"}
    ?uri dct:identifier ?id ;
      ?p ?o ;
      a ?class .
    OPTIONAL {?uri ubbont:hasThumbnail ?thumb } .
    BIND(str(?thumb) AS ?thumbString)
    OPTIONAL {?uri dct:title ?title } .
    OPTIONAL {?uri foaf:name ?name } .
    OPTIONAL {?uri skos:prefLabel ?prefLabel } .
    OPTIONAL {?uri rdfs:label ?rdfsLabel } .
    BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel) AS ?label) .
    # Get multipage image
    OPTIONAL { 
      ?uri ubbont:hasRepresentation / dct:hasPart ?page .
      ?page ubbont:sequenceNr 1 .
      ?page ubbont:hasResource ?resource .
      OPTIONAL {?resource ubbont:hasSMView ?smImage.}  
      OPTIONAL {?resource ubbont:hasMDView ?mdImage.}
    }
    # Get singlepage image
    OPTIONAL { 
      ?uri ubbont:hasRepresentation / dct:hasPart ?part .
      OPTIONAL {?part ubbont:hasMDView ?imgMD .}
      OPTIONAL {?part ubbont:hasSMView ?imgSM .} 
    }
    BIND (COALESCE(?imgMD,?imgSM,?mdImage,?smImage) AS ?image) . 
    OPTIONAL {
      ?uri ubbont:hasTranscription/ubbont:hasRepresentation/ubbont:hasURI ?transcription .
    }
    OPTIONAL { 
      ?o a ?oClass ;
        ?p2 ?o2 .
      FILTER(?p2 NOT IN (dct:hasPart, ubbont:isSubjectOf, ubbont:locationFor, foaf:made, ubbont:techniqueOf, ubbont:cataloguer, ubbont:isRightsHolderOf, skos:narrower, skos:broader, ubbont:ownedBy, dct:references, dct:isPartOf, dct:subject, dct:spatial, dct:isReferencedBy, ubbont:technique, bibo:owner, dct:relation, ubbont:reproduced, foaf:depiction, foaf:page, ubbont:formerOwnerOf, ubbont:commissioned, ubbont:originalCreatorOf, ubbont:published, dct:hasVersion, skos:inScheme, schema:sibling, schema:parent, schema:spouse))
      OPTIONAL { ?o dct:identifier ?identifier } .
      OPTIONAL { ?o (dct:title|foaf:name|skos:prefLabel|rdfs:label) ?oLabel } . 
      OPTIONAL {
        ?o wgs:long ?long ;
          wgs:lat ?lat .
      }
      FILTER(?oClass != rdfs:Class) .
    }
    OPTIONAL { 
      ?uri dct:license / rdfs:label ?licenseLabel .
    }
    FILTER(?o != ?uri)
    BIND(REPLACE(STR(?class), ".+[/#]([^/#]+)$", "$1") as ?type)
    BIND(iri(REPLACE(str(?uri), "http://data.ub.uib.no","https://marcus.uib.no","i")) as ?homepage)
    BIND(EXISTS{?uri ubbont:hasRepresentation ?repr} AS ?isDigitized)
    BIND(xsd:double(?long) as ?longDouble)
    BIND(xsd:double(?lat) as ?latDouble)
    FILTER(?p NOT IN (rdf:type, dct:hasPart, ubbont:cataloguer, ubbont:internalNote, ubbont:showWeb, ubbont:clause, ubbont:hasRepresentation, ubbont:hasThumbnail, dct:relation, dc:relation, dct:isReferencedBy, ubbont:hasTranscription, skos:inScheme))
  }
`

export const manifestSparqlQuery = `
  ${SPARQL_PREFIXES}
  CONSTRUCT { 
    ?s rdf:type sc:Manifest .
    ?s dct:identifier ?id .
    ?s dct:language ?lang .
    ?s rdfs:label ?label .
    ?s rdfs:seeAlso ?s .
    ?s sc:homepage ?homepage .
    ?s as:summary ?desc .
    ?s sc:thumbnail ?thumbString .
    ?s sc:items ?part .
    ?s sc:items ?singleCanvas .
    ?s sc:structures ?rangeURL .
    ?rangeURL rdf:type sc:Range .
    ?rangeURL sc:items ?part .
    ?rangeURL sc:items ?singleCanvas .
    ?part rdf:type sc:Canvas .
    ?part rdfs:label ?itemLabel .
    ?part sc:thumbnail ?canvasThumb .
    ?part sc:items ?resource .
    ?resource rdf:type oa:Annotation .
    ?resource ubbont:hasXLView ?partXLString ;
      ubbont:hasMDView ?partMDString ; 
      ubbont:hasSMView ?partSMString .
    ?singleCanvas rdf:type sc:Canvas .
    ?singleCanvas rdfs:label "1" .
    ?singleCanvas sc:thumbnail ?singleCanvasThumb .
    ?singleCanvas sc:items ?singlePart .
    ?singlePart rdf:type oa:Annotation ;
      ubbont:hasXLView ?singleXLString ;
      ubbont:hasMDView ?singleMDString ; 
      ubbont:hasSMView ?singleSMString .
  }
  WHERE { 
    VALUES ?id { "%id" }
    ?s dct:identifier ?id ;
      rdf:type/rdfs:subClassOf* bibo:Document ;
      ubbont:hasRepresentation ?repr ;
      ubbont:hasThumbnail ?thumb .
    OPTIONAL {?s dct:language/dct:identifier ?lang } .
    OPTIONAL {?s dct:title ?title } .
    OPTIONAL {?s foaf:name ?name } .
    OPTIONAL {?s skos:prefLabel ?prefLabel } .
    OPTIONAL {?s rdfs:label ?rdfsLabel } .
    BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel, "Mangler tittel") AS ?label) .
    OPTIONAL { ?s dct:description ?desc } .
    OPTIONAL { 
      ?repr dct:hasPart ?singlePart ;
        rdfs:label ?partLabel .
      ?singlePart  ubbont:hasXSView  ?singleCanvasThumb ;
        ubbont:hasSMView ?singleSM .
      OPTIONAL { ?singlePart ubbont:hasMDView ?singleMD . }
      OPTIONAL { ?singlePart ubbont:hasXLView ?singleXL . }
    }
    OPTIONAL { 
      ?repr dct:hasPart ?part ;
        rdfs:label ?partLabel .
      ?part ubbont:hasResource ?resource ;
        ubbont:sequenceNr ?seq .
      ?resource ubbont:hasXSView ?canvasThumb ;
        ubbont:hasSMView ?partSM . 
      OPTIONAL { ?resource ubbont:hasMDView ?partMD . }
      OPTIONAL { ?resource ubbont:hasXLView ?partXL . }
    }
    BIND(iri(concat("http://data.ub.uib.no/instance/", ?id, "/manifest/range/1")) AS ?rangeURL)
    BIND(iri(concat("http://data.ub.uib.no/instance/page/", ?id, "_p1")) AS ?singleCanvas)
    BIND(iri(replace(str(?s), "data.ub.uib.no", "marcus.uib.no", "i")) AS ?homepage)
    BIND(str(?seq) AS ?itemLabel)
    BIND(str(?thumb) AS ?thumbString)
    BIND(str(?singleSM) AS ?singleSMString)
    BIND(str(?singleMD) AS ?singleMDString)
    BIND(str(?singleXL) AS ?singleXLString)
    BIND(str(?partSM) AS ?partSMString)
    BIND(str(?partMD) AS ?partMDString)
    BIND(str(?partXL) AS ?partXLString)
  }
  ORDER BY ?s ?repr ?part ?resource
`