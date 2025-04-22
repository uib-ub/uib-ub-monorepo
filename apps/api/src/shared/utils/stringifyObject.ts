/**
 * Stringifies all values in an object
 * @description
 * This function takes an object and returns an object with all values as strings.
 * @param {object} o 
 * @returns object
 */

export function stringifyObject(o: Record<string, any>): Record<string, any> {
  Object.keys(o).forEach(k => {
    if (typeof o[k] === 'object') {
      return stringifyObject(o[k]);
    }
    o[k] = '' + o[k];
  });

  return o;
}