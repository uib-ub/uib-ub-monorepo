import { DATA_SOURCES } from '@config/constants'
//import { default as fetch } from '@helpers/fetchRetry'

export async function lookupService(id: string) {
  const sparqlAskQuery = `
    PREFIX dct: <http://purl.org/dc/terms/>
    ASK { 
      { 
        VALUES ?id { "${id}" }
        ?s dct:identifier ?id .
      }
      UNION
      {
        ?s dct:identifier ?id .
        FILTER langMatches( lang(?id), "no" ) 
      }
      UNION
      {
        ?s dct:identifier ?id .
        FILTER langMatches( lang(?id), "en" ) 
      }
    }      
  `
  /**
   * @todo
   * This is a Goobi query that looks for the id. 
   * Currently the real id is not used, as this has not 
   * been added to the SOLR index.
   */
  const goobiQuery = `{
    "query": "+PI_PARENT:${id}",
    "resultFields": [
      "*",
      "IDDOC",
      "DOCTYPE",
      "DOCSTRCT",
      "LABEL"
    ],
    "sortFields": [],
    "sortOrder": "asc",
    "jsonFormat": "recordcentric",
    "count": 10,
    "offset": 0,
    "randomize": false,
    "language": "en",
    "includeChildHits": false,
    "boostTopLevelDocstructs": false,
    "facetFields": []
  }`

  const sparqlPromises = DATA_SOURCES.filter(s => s.type === 'sparql').map(async (service: any) => {
    return fetch(`${service.url}${encodeURIComponent(sparqlAskQuery)}&output=json`).then(res => res.json()).then(res => {
      if (res.boolean) {
        return service
      }
      return
    })
  })

  const goobiPromise = DATA_SOURCES.filter(s => s.name === 'samla').map(async (service: any) => {
    return fetch(`${service.lookupUrl || service.url}`, {
      method: 'POST',
      body: goobiQuery,
      headers: { "content-type": "application/json" }
    }).then(res => res.json()).then(res => {
      if (res.numFound) {
        return service
      }
      return
    })
  })


  try {
    const data = await Promise.all([...sparqlPromises, ...goobiPromise]).then((values) => {
      return values.filter(Boolean)[0]
    })
    if (data) {
      return data
    }
    return {
      ok: false,
      message: `No match in any service`
    }
  } catch (error) {
    console.log(error)
  }
}

