import { reduceValuesByLanguage } from '../helpers/reduceValuesByLanguage'

describe('reduceValuesByLanguage', () => {
  test('should reduce values by language', () => {
    const values = [
      { en: 'Hello', de: 'Hallo' },
      { en: 'World' }
    ]

    const result = reduceValuesByLanguage(values)

    expect(result).toEqual({
      en: ['Hello', 'World'],
      de: ['Hallo']
    })
  })

  test('should handle empty values array', () => {
    const values: Record<string, any>[] = []

    const result = reduceValuesByLanguage(values)

    expect(result).toEqual({})
  })

  test('should handle values with missing keys', () => {
    const values = [
      { en: 'Hello', de: 'Hallo' },
      { en: 'World' },
      { fr: 'Bonjour' }
    ]

    const result = reduceValuesByLanguage(values)

    expect(result).toEqual({
      en: ['Hello', 'World'],
      de: ['Hallo'],
      fr: ['Bonjour']
    })
  })

  test('should handle values with array values', () => {
    const values = [
      { en: ['Hello', 'Hi'], de: 'Hallo' },
      { en: ['World'] },
      { fr: ['Bonjour', 'Salut'] }
    ]

    const result = reduceValuesByLanguage(values)

    expect(result).toEqual({
      en: ['Hello', 'Hi', 'World'],
      de: ['Hallo'],
      fr: ['Bonjour', 'Salut']
    })
  })
})
