const query = `
  PREFIX bibo: <http://purl.org/ontology/bibo/>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX ubbont: <http://data.ub.uib.no/ontology/>

  SELECT (count(?uri) as ?total) WHERE { 
    SERVICE <cache:> { 
      SELECT ?uri WHERE 
        { 
          ?uri rdf:type/rdfs:subClassOf* bibo:Document ;
            ubbont:showWeb true ;
            dct:identifier ?id .
        }
    }
  }
`