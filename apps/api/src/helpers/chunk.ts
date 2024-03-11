/**
 * Splits an array into chunks of a specified size.
 * @param array The array to be chunked.
 * @param size The size of each chunk.
 * @returns An array of chunks.
 */
export function chunk(array: any[], size: number): any[] {
  const chunked_arr: any[] = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
}