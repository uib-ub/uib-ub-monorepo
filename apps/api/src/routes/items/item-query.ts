export const itemQuery = `
  PREFIX muna: <http://muna.xyz/model/0.1/>
  PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/>
  PREFIX ecrm: <http://erlangen-crm.org/current/>
  PREFIX ubbont: <http://data.ub.uib.no/ontology/>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX dbo: <http://dbpedia.org/ontology/>
  PREFIX dc: <http://purl.org/dc/elements/1.1/>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX schema: <http://schema.org/>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
  PREFIX bibo: <http://purl.org/ontology/bibo/>
  PREFIX mo: <http://purl.org/ontology/mo/>
  PREFIX geo-deling: <http://vocab.lenka.no/geo-deling#>
  PREFIX wgs: <http://www.w3.org/2003/01/geo/wgs84_pos#>
  PREFIX dcmitype: <http://purl.org/dc/dcmitype/>
  PREFIX event: <http://purl.org/NET/c4dm/event.owl#>
  PREFIX geonames: <http://www.geonames.org/ontology#>
  PREFIX exif: <http://www.w3.org/2003/12/exif/ns#>
  PREFIX edm: <http://www.europeana.eu/schemas/edm/>
  PREFIX org: <http://www.w3.org/ns/org#>
  PREFIX bio: <http://purl.org/vocab/bio/0.1/>
  PREFIX frbr: <http://vocab.org/frbr/core#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX ore: <http://www.openarchives.org/ore/terms/>
  PREFIX nie: <http://www.semanticdesktop.org/ontologies/nie/#>
  PREFIX locah: <http://data.archiveshub.ac.uk/def/>
  PREFIX lexvo: <http://lexvo.org/ontology#>
  PREFIX cc: <http://creativecommons.org/ns#>
  PREFIX sc: <http://iiif.io/api/presentation/3#>
  PREFIX oa: <http://www.w3.org/ns/oa#>
  PREFIX iiif_prezi: <http://iiif.io/api/presentation/3#>
  PREFIX as: <http://www.w3.org/ns/activitystreams#>
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
    FILTER(STRENDS(STR(?uri), ?id))
    FILTER(?o != ?uri)
    BIND(REPLACE(STR(?class), ".+[/#]([^/#]+)$", "$1") as ?type)
    BIND(iri(REPLACE(str(?uri), "http://data.ub.uib.no","https://marcus.uib.no","i")) as ?homepage)
    BIND(EXISTS{?uri ubbont:hasRepresentation ?repr} AS ?isDigitized)
    BIND(xsd:double(?long) as ?longDouble)
    BIND(xsd:double(?lat) as ?latDouble)
    FILTER(?p NOT IN (rdf:type, dct:hasPart, ubbont:cataloguer, ubbont:internalNote, ubbont:showWeb, ubbont:clause, ubbont:hasRepresentation, ubbont:hasThumbnail, dct:relation, dc:relation, dct:isReferencedBy, ubbont:hasTranscription, skos:inScheme))
  }
`