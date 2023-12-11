/**
 * labelSplitter is a functions for handeling concatinated, multilingual strings. For SPARQL to calculate
 * offset and limit correctly each item in the set needs to be on one line.
 * @param {string} label
 * @returns {object}
 */
export const labelSplitter = (label) => {
  const splitted = label.split('|');
  const data = splitted.map(l => {
    const langArr = l.split('@');
    return {
      [langArr[1] ? `@${langArr[1]}` : '@none']: [langArr[0].replaceAll("\"", "")]
    };
  });
  return data[0];
};
