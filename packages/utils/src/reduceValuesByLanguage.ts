/**
 * @description
 * This function takes an array of objects and returns an object with the keys of the objects as keys and the values of the objects as values in an array.
 * @param {array} values
 * @returns {object}
 * @example
 * const values = [
 *  { en: 'Hello', de: 'Hallo' },
 *  { en: 'World' }
 * ]
 */

export const reduceValuesByLanguage = (values: Record<string, any>): Record<string, any> => {
  return values.reduce((acc: any, value: any) => {
    const keys = Object.keys(value)
    keys.forEach(key => {
      if (acc[key]) {
        acc[key].push(value[key])
      } else {
        acc[key] = [value[key]]
      }
    })
    return acc
  }, {})
}
