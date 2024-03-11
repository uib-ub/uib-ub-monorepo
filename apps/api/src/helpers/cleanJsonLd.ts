/**
 * Removes the '@context' key from a JSON-LD object and returns the cleaned object.
 * If the object has a single result, it is returned as an array.
 * 
 * @param jsonld The JSON-LD object to be cleaned.
 * @returns The cleaned JSON-LD object.
 */
export function cleanJsonld(jsonld: any): any[] {
  delete jsonld['@context'] // Delete annoying @context key
  return (jsonld['@graph'] ?? [jsonld]) // If there is only one result, it is not an array
}