/**
 * getSegmentFromUrlFromEnd
 * @param {string} url
 * @param {number} segment
 * @returns {string | undefined}
 * @example getSegmentFromUrl('https://example.com/segment1/segment2', -1)
 * @example getSegmentFromUrl('https://example.com/segment1/segment2', -2)
 */


export const pickSegmentFromEndOfUrl = (url: string, segment?: number): string | undefined => {
  if (!url) return undefined;

  if (segment) return new URL(url).pathname.split('/').filter(Boolean).slice(segment - 1, segment).pop();

  return new URL(url).pathname.split('/').filter(Boolean).pop();
}
