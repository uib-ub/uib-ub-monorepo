/**
 * Sparql Query Builder
 * Interpolates the query string with the given parameters. The parameters are expected to be in the form of an object.
 * The keys of the object should match the placeholders in the query string. The placeholders should be started by %. 
 * Any string that starts with an % that is not replced should result in an error.
 * @param query The query string with placeholders.
 * @param params The object with the values to replace the placeholders.
 * @returns The query string with the placeholders replaced by the values in the params object.
 */

function sparqlQueryBuilder(query: string, params: Record<string, string | number>): string {
  let result = query;
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const placeholder = `%${key}`;
      const value = params[key];
      result = result.replace(placeholder, String(value));
    }
  }
  if (result.includes('%')) {
    throw new Error('Missing parameter');
  }
  return result;
}

export { sparqlQueryBuilder as sqb };
