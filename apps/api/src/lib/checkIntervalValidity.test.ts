import { checkIntervalValidity } from './checkIntervalValidity';

describe('checkIntervalValidity', () => {
  test('should return the same values if "after" is less than "before"', () => {
    const after = { '@value': '2022-01-01' };
    const before = { '@value': '2022-02-01' };
    const result = checkIntervalValidity(after, before);
    expect(result).toEqual([after, before]);
  });

  test('should swap values if "after" is greater than "before"', () => {
    const after = { '@value': '2022-02-01' };
    const before = { '@value': '2022-01-01' };
    const result = checkIntervalValidity(after, before);
    expect(result).toEqual([before, after]);
  });
});