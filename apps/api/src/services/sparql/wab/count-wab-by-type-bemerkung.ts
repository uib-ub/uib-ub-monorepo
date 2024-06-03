import { DATA_SOURCES } from '@config/constants'

const WAB_API = DATA_SOURCES.filter((service) => service.name === 'wab')[0].url

export async function countByTypeWabBemerkung() {
  const query = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX ws: <http://purl.org/wittgensteinsource/ont/>
  PREFIX dct: <http://purl.org/dc/terms/> 
  SELECT ?class (count(distinct ?uri) as ?count)
  WHERE	{ 
    ?uri a ?class .
  }
  GROUP BY ?class`

  try {
    const result = await fetch(
      `${WAB_API}${encodeURIComponent(
        query,
      )}&output=json`,
    ).then((res: any) => res.json())

    const t =
      result.results.bindings.map((row: any) => {
        return {
          [row.class.value]: row.count.value
        }
      }).reduce((acc: any, obj: any) => ({ ...acc, ...obj }), {})

    return t

  } catch (error) {
    console.log(error)
  }
}