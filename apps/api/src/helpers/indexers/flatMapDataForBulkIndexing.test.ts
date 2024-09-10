import { flatMapDataForBulkIndexing } from './flatMapDataForBulkIndexing';

describe('flatMapDataForBulkIndexing', () => {
  test('should return an array of objects with index information and data', () => {
    const data = [{ name: 'John' }, { name: 'Jane' }];
    const indexName = 'myIndex';
    const result = flatMapDataForBulkIndexing(data, indexName);
    expect(result).toEqual([
      { index: { _index: 'myIndex' } },
      { name: 'John' },
      { index: { _index: 'myIndex' } },
      { name: 'Jane' }
    ]);
  });

  test('should return an empty array if data is empty', () => {
    const data: any[] = [];
    const indexName = 'myIndex';
    const result = flatMapDataForBulkIndexing(data, indexName);
    expect(result).toEqual([]);
  });
});