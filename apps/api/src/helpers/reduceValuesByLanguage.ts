/**
 * @description
 * This function takes an array of objects and returns an object with the keys of the objects as keys and the values of the objects as values in an array.
 * @param {array} values
 * @example
 * const values = [
 *  { en: 'Hello', de: 'Hallo' },
 *  { en: 'World' }
 * ]
 * @returns {
 *   en: ['Hello', 'World'],
 *   de: ['Hallo']
 * }
 */

export const reduceValuesByLanguage = (values: Record<string, any>[]): Record<string, any> => {
  return values.reduce((acc: Record<string, any[]>, value: Record<string, any>) => {
    const keys = Object.keys(value)

    keys.forEach((key: string) => {
      if (acc[key]) {
        if (Array.isArray(acc[key])) {
          if (Array.isArray(value[key])) {
            acc[key] = [...acc[key], ...value[key]]
          } else {
            acc[key].push(value[key])
          }
        } else {
          acc[key] = [acc[key], value[key]]
        }
      } else {
        if (Array.isArray(value[key])) {
          acc[key] = [...value[key]]
        } else {
          acc[key] = [value[key]]
        }
      }
    })

    return acc
  }, {})
}