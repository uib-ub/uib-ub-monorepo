import { isObjectEmpty } from '@lib/isObjectEmpty';

describe('isObjectEmpty', () => {
  test('should return true for an empty object', () => {
    const obj = {};
    const result = isObjectEmpty(obj);
    expect(result).toBe(true);
  });

  test('should return false for an object with properties', () => {
    const obj = { name: 'John', age: 30 };
    const result = isObjectEmpty(obj);
    expect(result).toBe(false);
  });

  test('should return false for an object with nested properties', () => {
    const obj = { person: { name: 'John', age: 30 } };
    const result = isObjectEmpty(obj);
    expect(result).toBe(false);
  });
});