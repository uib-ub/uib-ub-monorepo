/**
 * Checks the validity of an interval by comparing the "after" and "before" values.
 * If the "after" value is greater than the "before" value, the values are swapped.
 * @param after - The "after" value of the interval.
 * @param before - The "before" value of the interval.
 * @returns An array containing the "after" and "before" values, with the values potentially swapped if necessary.
 */
export const checkIntervalValidity = (after: any, before: any) => {
  if (new Date(after['@value']) > new Date(before['@value'])) {
    [after, before] = [before, after];
    console.log('Interval swaped: ', after['@value'], before['@value']);
    return [after, before];
  }
  return [after, before];
};
