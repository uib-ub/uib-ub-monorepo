/**
 * Return human readable date
 */
export function dateToString(date: string) {
  return new Date(date).toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
