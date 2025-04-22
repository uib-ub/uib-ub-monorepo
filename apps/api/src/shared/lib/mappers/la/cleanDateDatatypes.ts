import { JsonLd, JsonLdArray, JsonLdObj } from 'jsonld/jsonld-spec';

/**
 * Convert all date strings to a proper Date, input is a JSON-LD array or 
 * object. We do this because we can get dates of any types, and then 
 * framing the data will complain about the datatype.
 * 
 * RDF dates are not always in the same format, as it allows typed literals.
 * This leads to a lot of different date formats, which we need to clean up.
 * JSON-LD does not support multiple data types on the same property.
 * @returns {JsonLdArray} - The cleaned data
*/
export const cleanDateDatatypes = (data: JsonLd): JsonLdArray => {
  const props = [
    'http://purl.org/dc/terms/available',
    'http://purl.org/dc/terms/modified',
    'http://purl.org/dc/terms/issued',
  ];

  if (Array.isArray(data)) {
    /* @ts-ignore */
    return data.map((item: JsonLdObj) => {
      for (const prop of props) {
        if (item[prop]) {
          (item[prop] as JsonLdArray).map((date: any) => {
            date['@value'] = new Date(date['@value']).toISOString();
            return date;
          });
        }
      }
      return item as JsonLdObj;
    });
  } else {
    for (const prop of props) {
      if (data[prop]) {
        (data[prop] as JsonLdArray).map((date: any) => {
          date['@value'] = new Date(date['@value']).toISOString();
          return date;
        });
      }
    }
    return [data] as JsonLdArray;
  }
};
