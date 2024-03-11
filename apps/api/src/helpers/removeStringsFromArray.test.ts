import { removeStringsFromArray } from './removeStringsFromArray';

describe('removeStringsFromArray', () => {
  test('should remove non-object items from relation array', () => {
    const data = {
      relation: ['item1', { prop: 'value' }, 'item2'],
    };

    const result = removeStringsFromArray(data);

    expect(result.relation).toEqual([{ prop: 'value' }]);
  });

  test('should remove non-object items from hasPart array', () => {
    const data = {
      hasPart: ['item1', { prop: 'value' }, 'item2'],
    };

    const result = removeStringsFromArray(data);

    expect(result.hasPart).toEqual([{ prop: 'value' }]);
  });

  test('should remove non-object items from isPartOf array', () => {
    const data = {
      isPartOf: ['item1', { prop: 'value' }, 'item2'],
    };

    const result = removeStringsFromArray(data);

    expect(result.isPartOf).toEqual([{ prop: 'value' }]);
  });

  test('should remove non-object items from spatial array', () => {
    const data = {
      spatial: ['item1', { prop: 'value' }, 'item2'],
    };

    const result = removeStringsFromArray(data);

    expect(result.spatial).toEqual([{ prop: 'value' }]);
  });

  test('should remove non-object items from subject array', () => {
    const data = {
      subject: ['item1', { prop: 'value' }, 'item2'],
    };

    const result = removeStringsFromArray(data);

    expect(result.subject).toEqual([{ prop: 'value' }]);
  });

  // Add more tests for other arrays (isPartOf, spatial, subject)...

  test('should return the same data if all arrays contain only objects', () => {
    const data = {
      relation: [{ prop: 'value' }],
      hasPart: [{ prop: 'value' }],
      isPartOf: [{ prop: 'value' }],
      spatial: [{ prop: 'value' }],
      subject: [{ prop: 'value' }],
    };

    const result = removeStringsFromArray(data);

    expect(result).toEqual(data);
  });
});