import { DATA_SOURCES } from '../../../../config/constants'
import { isObjectEmpty } from '../../../../helpers/isObjectEmpty'

const WAB_API = DATA_SOURCES.filter((service) => service.name === 'wab')[0].url

export async function listWabBemerkung(page = 0, limit = 100) {
  const query = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX ws: <http://purl.org/wittgensteinsource/ont/>
  PREFIX dct: <http://purl.org/dc/terms/> 
  CONSTRUCT {
    ?uri dct:identifier ?uri .
  } WHERE { 
    SELECT DISTINCT ?uri WHERE 
      { 
        VALUES ?class { ws:Bemerkung ws:DiaryEntry ws:Correspondence ws:Recollection ws:LectureNotes ws:MS ws:TS }
        ?uri a ?class .
      }
    ORDER BY ?uri
    OFFSET ${(page * limit)}
    LIMIT ${limit}
  }`

  const result = await fetch(
    `${WAB_API}${encodeURIComponent(
      query,
    )}&output=json`,
  ).then((res: any) => res.json())

  if (isObjectEmpty(result)) {
    return []
  }

  const data = result['@graph'].map((item: any) => {
    const expandedID = item['@id']
      .replace('base:', "http://purl.org/wittgensteinsource/ont/")
      .replace('inst:', "http://purl.org/wittgensteinsource/ont/instances/")
      .replace('wgs:', "http://wittgensteinsource.org/")
    item.id = expandedID
    item.url = expandedID
    delete item['dct:identifier']['@value']
    delete item['dct:identifier']
    delete item['@id']
    return item
  })

  return data
}