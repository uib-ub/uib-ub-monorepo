import { any } from 'zod'
import { getTimespan } from './constructTimespan'

describe('getTimespan', () => {
  test('should return undefined if no date, after, and before are provided', () => {
    const result = getTimespan(undefined, undefined, undefined)
    expect(result).toBeUndefined()
  })

  test('should return the mapped EDTF string if a valid date is provided', () => {
    const result = getTimespan('2022-01-01', undefined, undefined)
    expect(result).toStrictEqual({
      beginOfTheBegin: "2022-01-01T00:00:00.000Z",
      edtf: "2022-01-01",
      endOfTheEnd: "2022-01-01T23:59:59.999Z",
      type: "Timespan"
    })
  })

  test('should return the mapped EDTF string if after and before are the same', () => {
    const result = getTimespan(undefined, '2022-01-01', '2022-01-01')
    expect(result).toStrictEqual({
      beginOfTheBegin: "2022-01-01T00:00:00.000Z",
      edtf: "2022-01-01",
      endOfTheEnd: "2022-01-01T23:59:59.999Z",
      type: "Timespan"
    })
  })

  test('should return the mapped EDTF string if after is provided', () => {
    const result = getTimespan(undefined, '2022-01-01', undefined)
    expect(result).toStrictEqual({
      beginOfTheBegin: "2022-01-01T00:00:00.000Z",
      edtf: "2022-01-01/",
      endOfTheBegin: "2022-01-01T23:59:59.999Z",
      type: "Timespan"
    })
  })

  test('should return the mapped EDTF string if before is provided', () => {
    const result = getTimespan(undefined, undefined, '2022-01-01')
    expect(result).toStrictEqual({
      beginOfTheEnd: "2022-01-01T00:00:00.000Z",
      edtf: "/2022-01-01",
      endOfTheEnd: "2022-01-01T23:59:59.999Z",
      type: "Timespan"
    })
  })

  test('should return the mapped EDTF string if both after and before are provided', () => {
    const result = getTimespan(undefined, '2022-01-01', '2022-12-31')
    expect(result).toStrictEqual({
      beginOfTheBegin: "2022-01-01T00:00:00.000Z",
      endOfTheBegin: "2022-01-01T23:59:59.999Z",
      edtf: "2022-01-01/2022-12-31",
      endOfTheEnd: "2022-12-31T23:59:59.999Z",
      beginOfTheEnd: "2022-12-31T00:00:00.000Z",
      type: "Timespan"
    })
  })

  test('should return undefined if an error occurs', () => {
    const result = getTimespan('invalid-date', undefined, undefined)
    expect(result).toBeUndefined()
  })
})