import { checkMembership, cn, truncate, uniqueStringArray } from './utils'

describe('checkMembership', () => {
  it('should return false if all members are active', () => {
    const members = [{ active: true }, { active: true }, { active: true }]
    expect(checkMembership(members)).toBe(false)
  })

  it('should return true if some members are active', () => {
    const members = [{ active: true }, { active: false }, { active: true }]
    expect(checkMembership(members)).toBe(true)
  })

  it('should return false if no members are active', () => {
    const members = [{ active: false }, { active: false }, { active: false }]
    expect(checkMembership(members)).toBe(false)
  })
})

describe('cn', () => {
  it('should return an empty string when no arguments are passed', () => {
    expect(cn()).toBe('')
  })

  it('should return a single class name when passed a single string argument', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('should return a single class name when passed a single object argument with a truthy value', () => {
    expect(cn({ foo: true })).toBe('foo')
  })

  it('should return an empty string when passed a single object argument with a falsy value', () => {
    expect(cn({ foo: false })).toBe('')
  })

  it('should return a space-separated list of class names when passed multiple string arguments', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('should return a space-separated list of class names when passed multiple object arguments with truthy values', () => {
    expect(cn({ foo: true }, { bar: true }, { baz: true })).toBe('foo bar baz')
  })

  it('should ignore object arguments with falsy values when passed multiple arguments', () => {
    expect(cn('foo', { bar: false }, 'baz', { qux: true })).toBe('foo baz qux')
  })

  it('should merge class names when passed nested arrays of arguments', () => {
    expect(cn(['foo', ['bar', 'baz']], 'qux')).toBe('foo bar baz qux')
  })
})

describe('uniqueStringArray', () => {
  it('should return an empty array when given an empty array', () => {
    expect(uniqueStringArray([])).toEqual([])
  })

  it('should return an array with the same elements when given an array with no duplicates', () => {
    expect(uniqueStringArray(['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
  })

  it('should return an array with duplicates removed when given an array with duplicates', () => {
    expect(uniqueStringArray(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c'])
  })
})

describe('truncate', () => {
  it('should return the original string if it is shorter than the limit', () => {
    const str = 'hello world'
    expect(truncate(str, 20)).toBe(str)
  })

  it('should truncate the string and add the default replacement if it is longer than the limit', () => {
    const str = 'hello world'
    expect(truncate(str, 5)).toBe('he...')
  })

  it('should truncate the string and add the specified replacement if it is longer than the limit', () => {
    const str = 'hello world'
    expect(truncate(str, 5, '***')).toBe('he***')
  })

  it('should return an empty string if the input string is empty', () => {
    expect(truncate('', 5)).toBe('')
  })
})
