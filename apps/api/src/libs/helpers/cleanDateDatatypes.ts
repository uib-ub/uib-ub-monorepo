/**
 * convert all date strings to a proper Date, input is a jsonld array
 * @param data
 * @returns
*/
export const cleanDateDatatypes = (data: any) => {
  const props = [
    'http://purl.org/dc/terms/available',
    'http://purl.org/dc/terms/modified',
    'http://purl.org/dc/terms/issued',
  ];
  return data.map((item: any) => {
    for (const prop of props) {
      if (item[prop]) {
        item[prop].map((date: any) => {
          date['@value'] = new Date(date['@value']).toISOString();

          return date;
        });
      }
    }
    return item;
  });
};
