import { pickSegmentFromEndOfUrl } from '../helpers/pickSegmentFromEndOfUrl';

describe('pickSegmentFromEndOfUrl', () => {
  test('should return the last segment of the URL', () => {
    const url = 'https://example.com/segment1/segment2';
    const result = pickSegmentFromEndOfUrl(url);
    expect(result).toBe('segment2');
  });

  test('should return the second last segment of the URL', () => {
    const url = 'https://example.com/segment1/segment2';
    const result = pickSegmentFromEndOfUrl(url, -1);
    expect(result).toBe('segment1');
  });

  test('should return undefined if the URL is empty', () => {
    const url = '';
    const result = pickSegmentFromEndOfUrl(url);
    expect(result).toBeUndefined();
  });

  test('should return undefined if the URL has no segments', () => {
    const url = 'https://example.com';
    const result = pickSegmentFromEndOfUrl(url);
    expect(result).toBeUndefined();
  });
});