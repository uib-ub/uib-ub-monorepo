/**
 * getFootnoteNumberArray
 * return object
 */
export const getFootnotesNumberArray = (blocks) => {
  return (
    blocks
      // filter out everything that's not a text block
      .filter(({ _type }) => _type === 'block')
      // make an array of the mark definitions of those blocks
      .reduce((acc, curr) => {
        return [...acc, ...curr.markDefs]
      }, [])
      // find all the footnote mark definitions
      .filter(({ _type }) => _type === 'footnote')
      // reduce to object with mark as key and index as value
      .reduce(function (acc, curr, index) {
        return { ...acc, [curr._key]: index + 1 }
      }, {})
  )
}
