export const convertToFloat = (data: any) => {
  const props = [
    'http://www.w3.org/2003/01/geo/wgs84_pos#lat',
    'http://www.w3.org/2003/01/geo/wgs84_pos#long',
  ];
  return data.map((item: any) => {
    for (const prop of props) {
      if (item[prop]) {
        item[prop].map((n: any) => {
          n['@value'] = parseFloat(n['@value']);

          return n;
        });
      }
    }
    return item;
  });
};
