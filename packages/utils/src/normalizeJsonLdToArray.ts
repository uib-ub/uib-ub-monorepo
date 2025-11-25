/**
 * Removes the '@context' key from a JSON-LD object and returns the cleaned object.
 * If the object has a single result, it is returned as an array.
 * 
 * @param jsonld The JSON-LD object to be cleaned.
 * @returns The cleaned JSON-LD object.
 */
export function normalizeJsonLdToArray(jsonld: any): any[] {
  // Create a new object without the @context key
  const { '@context': _, ...rest } = jsonld;
  return (rest['@graph'] ?? [rest]); // If there is only one result, it is not an array
}