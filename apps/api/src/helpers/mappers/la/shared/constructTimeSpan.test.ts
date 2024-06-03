import { getTimeSpan } from './constructTimeSpan'

describe('getTimeSpan', () => {
  test('should return undefined if no date, after, and before are provided', () => {
    const result = getTimeSpan(undefined, undefined, undefined)
    expect(result).toBeUndefined()
  })

  test('should return the mapped EDTF string if a valid date is provided', () => {
    const result = getTimeSpan('2022-01-01', undefined, undefined)
    expect(result).toStrictEqual({
      begin_of_the_begin: "2022-01-01T00:00:00.000Z",
      edtf: "2022-01-01",
      end_of_the_end: "2022-01-01T23:59:59.999Z",
      type: "TimeSpan"
    })
  })

  test('should return the mapped EDTF string if after and before are the same', () => {
    const result = getTimeSpan(undefined, '2022-01-01', '2022-01-01')
    expect(result).toStrictEqual({
      begin_of_the_begin: "2022-01-01T00:00:00.000Z",
      edtf: "2022-01-01",
      end_of_the_end: "2022-01-01T23:59:59.999Z",
      type: "TimeSpan"
    })
  })

  test('should return the mapped EDTF string if after is provided', () => {
    const result = getTimeSpan(undefined, '2022-01-01', undefined)
    expect(result).toStrictEqual({
      begin_of_the_begin: "2022-01-01T00:00:00.000Z",
      edtf: "2022-01-01/",
      end_of_the_begin: "2022-01-01T23:59:59.999Z",
      type: "TimeSpan"
    })
  })

  test('should return the mapped EDTF string if before is provided', () => {
    const result = getTimeSpan(undefined, undefined, '2022-01-01')
    expect(result).toStrictEqual({
      begin_of_the_end: "2022-01-01T00:00:00.000Z",
      edtf: "/2022-01-01",
      end_of_the_end: "2022-01-01T23:59:59.999Z",
      type: "TimeSpan"
    })
  })

  test('should return the mapped EDTF string if both after and before are provided', () => {
    const result = getTimeSpan(undefined, '2022-01-01', '2022-12-31')
    expect(result).toStrictEqual({
      begin_of_the_begin: "2022-01-01T00:00:00.000Z",
      end_of_the_begin: "2022-01-01T23:59:59.999Z",
      edtf: "2022-01-01/2022-12-31",
      end_of_the_end: "2022-12-31T23:59:59.999Z",
      begin_of_the_end: "2022-12-31T00:00:00.000Z",
      type: "TimeSpan"
    })
  })

  test('should return undefined if an error occurs', () => {
    const result = getTimeSpan('invalid-date', undefined, undefined)
    expect(result).toBeUndefined()
  })
})