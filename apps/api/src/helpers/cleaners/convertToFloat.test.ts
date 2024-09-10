import { convertToFloat } from './convertToFloat';

describe('convertToFloat', () => {
  test('should convert specified properties to float values', () => {
    const data = [
      {
        'http://www.w3.org/2003/01/geo/wgs84_pos#lat': [
          { '@value': '12.345' },
        ],
        'http://www.w3.org/2003/01/geo/wgs84_pos#long': [
          { '@value': '98.765' },
        ],
      },
      {
        'http://www.w3.org/2003/01/geo/wgs84_pos#lat': [
          { '@value': '54.321' },
        ],
        'http://www.w3.org/2003/01/geo/wgs84_pos#long': [
          { '@value': '76.543' },
        ],
      },
    ];

    const result = convertToFloat(data);

    expect(result).toEqual([
      {
        'http://www.w3.org/2003/01/geo/wgs84_pos#lat': [
          { '@value': 12.345 },
        ],
        'http://www.w3.org/2003/01/geo/wgs84_pos#long': [
          { '@value': 98.765 },
        ],
      },
      {
        'http://www.w3.org/2003/01/geo/wgs84_pos#lat': [
          { '@value': 54.321 },
        ],
        'http://www.w3.org/2003/01/geo/wgs84_pos#long': [
          { '@value': 76.543 },
        ],
      },
    ]);
  });
});