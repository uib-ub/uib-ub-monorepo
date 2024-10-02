import { stringifyObject } from './stringifyObject';

describe('stringifyObject', () => {
  test('should stringify all values in the object', () => {
    const obj = {
      name: 'John',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'New York',
        number: 123,
      },
    };

    const result = stringifyObject(obj);

    expect(result.name).toBe('John');
    expect(result.age).toBe('30');
    expect(result.address.street).toBe('123 Main St');
    expect(result.address.city).toBe('New York');
    expect(result.address.number).toBe('123');
  });
});