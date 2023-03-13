export default function getQuery(uri) {
  let query = `
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX ubbont: <http://data.ub.uib.no/ontology/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX wgs: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX bibo: <http://purl.org/ontology/bibo/>
    
    CONSTRUCT {
      ?uri a ?type ;
        dct:title ?title ; 
        dct:identifier ?id ;
        dct:description ?description ;
        dct:created ?created ;
        ubbont:madeAfter ?madeAfter ;
        ubbont:madeBefore ?madeBefore ;
        ubbont:homepage ?homepage ;
        ubbont:image ?image ;
        dct:license ?licenseLabel ;
        dct:subject ?subject ;
        dct:spatial ?spatial ;
        foaf:depicts ?depicts ;
        foaf:maker ?maker .
      ?subject ?subjectP ?subjectO .
      ?spatial ?spatialP ?spatialO .
      ?depicts foaf:name ?depictsLabel ;
        dct:identifier ?depictsIdentifier .
      ?maker foaf:name ?makerLabel ;
        dct:identifier ?makerIdentifier .
    } WHERE { 
      GRAPH ?g {
        VALUES ?uri {<${uri}>}
        ?uri a ?type ;
          dct:title ?title ; 
          dct:identifier ?id .
        BIND(iri(REPLACE(str(?uri), "http://data.ub.uib.no","https://katalog.skeivtarkiv.no","i")) as ?homepage) .
        OPTIONAL { ?uri dct:description ?description . }
        OPTIONAL { ?uri dct:created ?created . }
        OPTIONAL { ?uri ubbont:madeAfter ?madeAfter . }
        OPTIONAL { ?uri ubbont:madeBefore ?madeBefore . }
        OPTIONAL { 
      	  ?uri dct:license / rdfs:label ?licenseLabel .
    	  }
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
        BIND (COALESCE(?imgMD,?imgSM,?mdImage,?smImage) AS ?image).
        # Get relations and filter unwanted props as this makes construct easier
        OPTIONAL { 
          ?uri dct:subject ?subject . 
          ?subject ?subjectP ?subjectO . 
          FILTER(?subjectP != ubbont:isSubjectOf && ?subjectP != skos:related && ?subjectP != skos:inScheme && ?subjectP != skos:narrower && ?subjectP != skos:broader && ?subjectP != ubbont:previousIdentifier && ?subjectP != dct:relation)
        }
        OPTIONAL { 
          ?uri dct:spatial ?spatial . 
          ?spatial ?spatialP ?spatialO . 
          FILTER(?spatialP != skos:narrower && ?spatialP != skos:broader && ?spatialP != ubbont:previousIdentifier && ?spatialP != ubbont:locationFor && ?spatialP != dct:relation  && ?spatialP != dc:relation)
        }
        OPTIONAL { 
          ?uri foaf:depicts ?depicts . 
          ?depicts foaf:name ?depictsLabel .
          ?depicts dct:identifier ?depictsIdentifier .
        }
        OPTIONAL { 
          ?uri foaf:maker ?maker . 
          ?maker foaf:name ?makerLabel .
          ?maker dct:identifier ?makerIdentifier .
        }
      } 
    }
  `
  return query
}
