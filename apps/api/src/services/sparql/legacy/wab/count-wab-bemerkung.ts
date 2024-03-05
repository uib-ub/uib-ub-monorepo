import { DATA_SOURCES } from '../../../../config/constants'

const WAB_API = DATA_SOURCES.filter((service) => service.name === 'wab')[0].url

export async function countWabBemerkung() {
  const query = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX ws: <http://purl.org/wittgensteinsource/ont/>
  PREFIX dct: <http://purl.org/dc/terms/> 
  SELECT (count(distinct ?uri) as ?count)
  WHERE	{ 
    VALUES ?class { ws:Bemerkung ws:DiaryEntry ws:Correspondence ws:Recollection ws:LectureNotes ws:MS ws:TS }
    ?uri a ?class .
  }
  ORDER BY ?uri`

  try {
    const result = await fetch(
      `${WAB_API}${encodeURIComponent(
        query,
      )}&output=json`,
    ).then((res: any) => res.json())

    return result.results.bindings[0].count.value
  } catch (error) {
    console.log(error)
  }
}
