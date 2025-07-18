export const personQuery = `
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
    ?uri a crm:E21_Person ;
      ?p ?o ;
      crm:P2_has_type ?type ;
      rdfs:label ?label ;
      foaf:homepage ?homepage .
    ?o a ?oClass ;
      ?p2 ?o2 ;
      dct:identifier ?oIdentifier ;
      foaf:gender ?oGender ;
      rdfs:label ?oLabel ;
      ubbont:hasURI ?hasURI .
  } WHERE { 
    VALUES ?id {"%id"}
    VALUES ?types { foaf:Person ubbont:Cataloguer }
    ?uri dct:identifier ?id ;
      rdf:type ?types ;
      ?p ?o ;
      a ?class .
    OPTIONAL {?uri dct:title ?title } .
    OPTIONAL {?uri foaf:name ?name } .
    OPTIONAL {?uri skos:prefLabel ?prefLabel } .
    OPTIONAL {?uri rdfs:label ?rdfsLabel } .
    BIND (COALESCE(?title,?name,?prefLabel,?rdfsLabel) AS ?label) .  
    OPTIONAL { 
      ?o a ?oClass ;
      dct:identifier ?oIdentifier ;
      OPTIONAL { ?o foaf:gender ?oGender } .
      OPTIONAL { ?o (dct:title|foaf:name|skos:prefLabel|rdfs:label) ?oLabel } . 
      OPTIONAL { ?o ubbont:hasURI ?hasURI } .
      FILTER(?oClass != rdfs:Class) .
    }
    FILTER(STRENDS(STR(?uri), ?id)) .
    FILTER(?o != ?uri) .
    BIND(REPLACE(STR(?class), ".+[/#]([^/#]+)$", "$1") as ?type) .
    BIND(iri(REPLACE(str(?uri), "http://data.ub.uib.no","https://marcus.uib.no","i")) as ?homepage) .
    FILTER(?p NOT IN (rdf:type, foaf:made, dct:hasPart, ubbont:cataloguer, ubbont:internalNote, ubbont:showWeb, ubbont:clause, ubbont:hasRepresentation, ubbont:hasThumbnail, dct:relation, dc:relation, dct:isReferencedBy, ubbont:hasTranscription, skos:inScheme, ubbont:published))
  }
`