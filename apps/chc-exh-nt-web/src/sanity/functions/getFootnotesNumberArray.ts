/**
 * getFootnoteNumberArray
 * return object
 */
export const getFootnotesNumberArray = (blocks: any) => {
  return (
    blocks
      // filter out everything that's not a text block
      .filter(({ _type }: any) => _type === 'block')
      // make an array of the mark definitions of those blocks
      .reduce((acc: any, curr: any) => {
        return [...acc, ...curr.markDefs]
      }, [])
      // find all the footnote mark definitions
      .filter(({ _type }: any) => _type === 'footnote')
      // reduce to object with mark as key and index as value
      .reduce(function (acc: any, curr: any, index: any) {
        return { ...acc, [curr._key]: index + 1 }
      }, {})
  )
}
